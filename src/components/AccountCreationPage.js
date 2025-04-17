// src/components/AccountCreationPage.js
import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Box,
} from "@mui/material";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const AccountCreationPage = () => {
  const [accountName, setAccountName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError("");

    if (!accountName.trim()) {
      setError("Account name is required.");
      return;
    }

    try {
      // 1. Create new account document
      const accountRef = await addDoc(collection(db, "accounts"), {
        name: accountName,
        createdBy: auth.currentUser.uid,
        createdAt: new Date(),
      });

      // 2. Create the user doc with accountId
      await setDoc(doc(db, "users", auth.currentUser.uid), {
        accountId: accountRef.id,
        role: "admin",
        email: auth.currentUser.email,
      });

      navigate("/");
    } catch (err) {
      console.error("Error creating account:", err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" gutterBottom>
          Create Your Account
        </Typography>
        <Typography variant="body2" gutterBottom>
          You don't belong to an account yet. Please create one to get started.
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        <Box
          component="form"
          onSubmit={handleCreateAccount}
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
        >
          <TextField
            label="Account Name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
          />
          <Button type="submit" variant="contained">
            Create Account
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default AccountCreationPage;
