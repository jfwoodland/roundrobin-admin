import React, { useEffect, useState } from "react";
import { db, auth } from "./firebaseConfig";
import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Container,
  Paper,
  Typography,
  Tabs,
  Tab,
  Box,
  Chip,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

// 🔹 Custom components
import SortableUserItem from "./components/SortableUserItem";
import UserCard from "./components/UserCard";
import UserForm from "./components/UserForm";
import TabPanel from "./components/TabPanel";
import { parsePhoneNumberFromString } from "libphonenumber-js";

// 🔹 Utils
import {
  normalizePhoneForStorage,
  formatDisplayPhone,
} from "./utils/phoneFormatters";

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [newUserName, setNewUserName] = useState("");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [editUserId, setEditUserId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const sensors = useSensors(useSensor(PointerSensor));
  const accountId = "demo-account-001";
  const navigate = useNavigate();

  // 🔒 Redirect to login if not authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // 🔄 Load users
  useEffect(() => {
    const q = query(
      collection(db, "accounts", accountId, "users"),
      orderBy("order")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const loadedUsers = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(loadedUsers);
    });
    return () => unsubscribe();
  }, [accountId]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = users.findIndex((u) => u.id === active.id);
      const newIndex = users.findIndex((u) => u.id === over.id);
      const newUsers = arrayMove(users, oldIndex, newIndex);
      setUsers(newUsers);

      const batchUpdates = newUsers.map((user, idx) =>
        updateDoc(doc(db, "accounts", accountId, "users", user.id), {
          order: idx,
        })
      );
      await Promise.all(batchUpdates);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    const phoneObj = parsePhoneNumberFromString(newUserPhone, "US");
    if (!phoneObj || !phoneObj.isValid()) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    const newUser = {
      name: newUserName,
      phone_number: phoneObj.number,
      status: "available",
      order: users.length,
    };

    try {
      await addDoc(collection(db, "accounts", accountId, "users"), newUser);
      setNewUserName("");
      setNewUserPhone("");
    } catch (err) {
      console.error("Error adding user:", err);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteDoc(doc(db, "accounts", accountId, "users", userId));
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  const handleEditUser = async () => {
    const phoneObj = parsePhoneNumberFromString(editPhone, "US");
    if (!phoneObj || !phoneObj.isValid()) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    try {
      await updateDoc(doc(db, "accounts", accountId, "users", editUserId), {
        name: editName,
        phone_number: phoneObj.number,
      });
      setEditUserId(null);
      setEditName("");
      setEditPhone("");
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ padding: 3, marginTop: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Panel
        </Typography>
        <Button
          variant="outlined"
          color="secondary"
          sx={{ float: "right" }}
          onClick={async () => {
            await auth.signOut();
          }}
        >
          Logout
        </Button>
        <Tabs
          value={tabIndex}
          onChange={(e, newIndex) => setTabIndex(newIndex)}
        >
          <Tab label="Call Order" />
          <Tab label="Add/Remove Users" />
        </Tabs>

        <TabPanel value={tabIndex} index={0}>
          <Typography variant="h6">Drag and drop to reorder users:</Typography>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={users.map((u) => u.id)}
              strategy={verticalListSortingStrategy}
            >
              {users.map((user) => (
                <SortableUserItem
                  key={user.id}
                  id={user.id}
                  name={user.name || user.phone_number}
                  status={user.status}
                />
              ))}
            </SortableContext>
          </DndContext>
        </TabPanel>

        <TabPanel value={tabIndex} index={1}>
          <Typography variant="h6">
            {editUserId ? "Edit User" : "Add a New User"}
          </Typography>

          <UserForm
            onSubmit={editUserId ? handleEditUser : handleAddUser}
            name={editUserId ? editName : newUserName}
            phone={editUserId ? editPhone : newUserPhone}
            setName={editUserId ? setEditName : setNewUserName}
            setPhone={editUserId ? setEditPhone : setNewUserPhone}
            isEdit={!!editUserId}
            onCancel={() => {
              setEditUserId(null);
              setEditName("");
              setEditPhone("");
            }}
          />

          <Typography variant="h6" sx={{ mt: 4 }}>
            Current Users
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <Chip label="Available" color="success" size="small" />
            <Chip label="In Call" color="warning" size="small" />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onUpdate={(id, name, phone) => {
                  setEditUserId(id);
                  setEditName(name);
                  setEditPhone(phone);
                }}
                onDelete={handleDeleteUser}
              />
            ))}
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default AdminPanel;
