'use client'

import { useState, useEffect } from 'react'
import { Box, Grid, Typography, Button, Modal, TextField, Stack } from '@mui/material'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 320,
  bgcolor: '#ffffff',
  border: '1px solid #e0e0e0',
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)',
  p: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [quantity, setQuantity] = useState('')
  const [quantityToAdd, setQuantityToAdd] = useState('')
  const [quantityToRemove, setQuantityToRemove] = useState('')
  const [editOpen, setEditOpen] = useState({})
  const [filterCriteria, setFilterCriteria] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    updateInventory()
  }, [filterCriteria, searchTerm])  // Re-run when filterCriteria or searchTerm changes

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })

    // Apply filtering based on searchTerm
    let filteredInventory = inventoryList.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Apply quantity filtering
    if (filterCriteria === 'low') {
      filteredInventory = filteredInventory.filter(item => item.quantity <= 10)
    } else if (filterCriteria === 'medium') {
      filteredInventory = filteredInventory.filter(item => item.quantity > 10 && item.quantity <= 50)
    } else if (filterCriteria === 'high') {
      filteredInventory = filteredInventory.filter(item => item.quantity > 50)
    }

    // Apply sorting based on filterCriteria
    if (filterCriteria === 'a-z') {
      filteredInventory.sort((a, b) => a.name.localeCompare(b.name))
    } else if (filterCriteria === 'z-a') {
      filteredInventory.sort((a, b) => b.name.localeCompare(a.name))
    } else if (filterCriteria === 'low') {
      // Already filtered
    } else if (filterCriteria === 'medium') {
      // Already filtered
    } else if (filterCriteria === 'high') {
      // Already filtered
    }

    setInventory(filteredInventory)
  }

  const addItem = async (item, quantity) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data()
      await setDoc(docRef, { quantity: existingQuantity + parseInt(quantity, 10) })
    } else {
      await setDoc(docRef, { quantity: parseInt(quantity, 10) })
    }
    await updateInventory()
  }
  
  const removeItem = async (item, amount) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity: existingQuantity } = docSnap.data()
      if (existingQuantity <= amount) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: existingQuantity - amount })
      }
    }
    await updateInventory()
  }

  const deleteItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    await deleteDoc(docRef)
    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleEditToggle = (itemName) => {
    setEditOpen((prev) => ({
      ...prev,
      [itemName]: !prev[itemName]
    }))
  }

  const handleFilter = (event) => {
    setFilterCriteria(event.target.value)
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value)
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      padding={2}
      bgcolor="#fdaa4e"  // Updated background color
    >
      <Box
        width="100%"
        maxWidth="500px"  // Adjusted width
        padding={2}
        bgcolor="#ffffff"
        borderRadius={2}
        boxShadow="0 8px 16px rgba(0, 0, 0, 0.1)"
        mb={2}
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{ 
          border: '1px solid #dcdcdc',  // Updated border color
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" color="#333" fontWeight="bold">
          Pantry Tracker
        </Typography>
        <Button 
          variant="contained" 
          onClick={handleOpen} 
          sx={{ 
            mt: 1, 
            bgcolor: '#fa6602', 
            '&:hover': { bgcolor: '#e55a02' }  // Hover color
          }}
        >
          Add New Item
        </Button>
        <TextField
          id="search"
          label="Search"
          variant="outlined"
          fullWidth
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ mt: 1 }}
        />
        <TextField
          id="filter"
          select
          label="Filter"
          variant="outlined"
          fullWidth
          size="small"
          value={filterCriteria}
          onChange={handleFilter}
          sx={{ mt: 1 }}
          SelectProps={{
            native: true,
          }}
        >
          <option value="all">All</option>
          <option value="low">Low Quantity (10 or less)</option>
          <option value="medium">Medium Quantity (11 to 50)</option>
          <option value="high">High Quantity (more than 50)</option>
          <option value="a-z">Alphabetical A-Z</option>
          <option value="z-a">Alphabetical Z-A</option>
        </TextField>
      </Box>
      
      {/* Inventory Items */}
      <Box
        width="100%"
        display="flex"
        flexDirection="column"
        alignItems="center"
        overflow="auto"
        flexGrow={1}
      >
        <Grid container spacing={2} justifyContent="center">
          {inventory.map(({ name, quantity }, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={name}>
              <Box
                width="100%"
                maxWidth="320px"  // Set a max-width for the item boxes
                minHeight="180px"  // Adjusted height
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                bgcolor="#ffffff"
                padding={2}
                borderRadius={2}
                boxShadow="0 12px 24px rgba(0, 0, 0, 0.2)"  // Enhanced shadow
                sx={{ 
                  marginY: 1,
                  position: 'relative',
                  border: 'none'  // Remove border
                }}
              >
                <Typography
                  variant="caption"
                  color="#333"  // Color of the text
                  fontSize="18px"
                  fontWeight="bold"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    left: 8,
                    backgroundColor: '#fdaa4e',  // Same as the main background color
                    padding: '2px 6px',
                    borderRadius: 1,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                    color: '#ffffff'  // Ensure text is visible
                  }}
                >
                  #{index + 1}
                </Typography>
                <Typography 
                  variant="h5"  // Increased font size for item name
                  color="#333" 
                  fontWeight="bold" 
                  textAlign="center"
                  sx={{ 
                    marginBottom: '2px',
                    lineHeight: 1.2,
                  }}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
                <Typography 
                  variant="body1" 
                  color="#555"  // Updated color
                  fontSize="16px" 
                  sx={{ 
                    marginTop: '0',  // Closer to the item name
                    lineHeight: 1.2,
                  }}
                >
                  Quantity: {quantity}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => handleEditToggle(name)}
                  sx={{ 
                    mt: 1, 
                    borderColor: '#fa6602', 
                    color: '#fa6602',
                    '&:hover': {
                      borderColor: '#e55a02',
                      color: '#e55a02',
                      backgroundColor: '#fff3e0'
                    }
                  }}
                >
                  {editOpen[name] ? 'Close Edit' : 'Edit'}
                </Button>
                {editOpen[name] && (
                  <Box
                    width="100%"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={0.5}
                    mt={1}
                  >
                    <Box display="flex" alignItems="center" gap={1} width="100%">
                      <TextField
                        id={`add-quantity-${name}`}
                        label="Add Quantity"
                        variant="outlined"
                        size="small"
                        type="number"
                        onChange={(e) => setQuantityToAdd(e.target.value)}
                        sx={{ fontSize: '14px', flex: 1 }}
                      />
                      <Button
                        variant="contained"
                        onClick={() => addItem(name, quantityToAdd)}
                        sx={{ 
                          fontSize: '14px', 
                          bgcolor: '#fa6602',
                          '&:hover': {
                            bgcolor: '#e55a02'
                          }
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1} width="100%">
                      <TextField
                        id={`remove-quantity-${name}`}
                        label="Remove Quantity"
                        variant="outlined"
                        size="small"
                        type="number"
                        onChange={(e) => setQuantityToRemove(e.target.value)}
                        sx={{ fontSize: '14px', flex: 1 }}
                      />
                      <Button
                        variant="contained"
                        onClick={() => removeItem(name, quantityToRemove)}
                        sx={{ 
                          fontSize: '14px', 
                          bgcolor: '#fa6602',
                          '&:hover': {
                            bgcolor: '#e55a02'
                          }
                        }}
                      >
                        Remove
                      </Button>
                    </Box>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => deleteItem(name)}
                      sx={{ 
                        mt: 0.5, 
                        fontSize: '14px', 
                        borderColor: '#d32f2f', 
                        color: '#d32f2f',
                        '&:hover': {
                          borderColor: '#b71c1c',
                          color: '#b71c1c',
                          backgroundColor: '#f8d7da'
                        }
                      }}
                    >
                      Delete Item
                    </Button>
                  </Box>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Add Item Modal */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Item
          </Typography>
          <Stack width="100%" spacing={1}>
            <TextField
              id="item-name"
              label="Item"
              variant="outlined"
              fullWidth
              size="small"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <TextField
              id="item-quantity"
              label="Quantity"
              variant="outlined"
              fullWidth
              size="small"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName, quantity)
                setItemName('')
                setQuantity('')
                handleClose()
              }}
              sx={{ 
                mt: 1, 
                bgcolor: '#fa6602',
                '&:hover': { 
                  bgcolor: '#e55a02' 
                } 
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  )
}
