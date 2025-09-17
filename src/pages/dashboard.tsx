import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material'
import {
  Add,
  Schedule,
  CheckCircle,
  Error,
  Refresh,
  Delete,
} from '@mui/icons-material'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { format } from 'date-fns'

interface PinQueue {
  id: string
  title: string
  description: string
  imageUrl: string
  link?: string
  scheduledAt: string
  posted: boolean
  postedAt?: string
  errorMessage?: string
  retryCount: number
  board?: {
    name: string
  }
}

interface Board {
  id: string
  name: string
  description: string
  url: string
  pinCount: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [pins, setPins] = useState<PinQueue[]>([])
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [openDialog, setOpenDialog] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    link: '',
    boardId: '',
    scheduledAt: new Date(),
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    } else if (session) {
      fetchData()
    }
  }, [session, status, router])

  const fetchData = async () => {
    try {
      const [pinsRes, boardsRes] = await Promise.all([
        fetch('/api/pins/queue'),
        fetch('/api/pinterest/boards'),
      ])

      const pinsData = await pinsRes.json()
      const boardsData = await boardsRes.json()

      setPins(pinsData.pins || [])
      setBoards(boardsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePin = async () => {
    try {
      const response = await fetch('/api/pins/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          scheduledAt: formData.scheduledAt.toISOString(),
        }),
      })

      if (response.ok) {
        setOpenDialog(false)
        setFormData({
          title: '',
          description: '',
          imageUrl: '',
          link: '',
          boardId: '',
          scheduledAt: new Date(),
        })
        fetchData()
      } else {
        const error = await response.json()
        console.error('Error creating pin:', error)
      }
    } catch (error) {
      console.error('Error creating pin:', error)
    }
  }

  const handleDeletePin = async (pinId: string) => {
    if (!confirm('Are you sure you want to delete this pin?')) return

    try {
      const response = await fetch(`/api/pins/${pinId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting pin:', error)
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchData}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Add Pin
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Total Pins
              </Typography>
              <Typography variant="h3" color="primary">
                {pins.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Posted
              </Typography>
              <Typography variant="h3" color="success.main">
                {pins.filter(pin => pin.posted).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h3" color="warning.main">
                {pins.filter(pin => !pin.posted).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pin Queue
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Title</TableCell>
                      <TableCell>Board</TableCell>
                      <TableCell>Scheduled</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pins.map((pin) => (
                      <TableRow key={pin.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" noWrap>
                              {pin.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {pin.description.substring(0, 50)}...
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{pin.board?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {format(new Date(pin.scheduledAt), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          {pin.posted ? (
                            <Chip
                              icon={<CheckCircle />}
                              label="Posted"
                              color="success"
                              size="small"
                            />
                          ) : pin.errorMessage ? (
                            <Chip
                              icon={<Error />}
                              label="Error"
                              color="error"
                              size="small"
                            />
                          ) : (
                            <Chip
                              icon={<Schedule />}
                              label="Pending"
                              color="warning"
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={() => handleDeletePin(pin.id)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Pin</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              margin="normal"
              multiline
              rows={3}
            />
            <TextField
              fullWidth
              label="Image URL"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Link (optional)"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Board</InputLabel>
              <Select
                value={formData.boardId}
                onChange={(e) => setFormData({ ...formData, boardId: e.target.value })}
              >
                {boards.map((board) => (
                  <MenuItem key={board.id} value={board.id}>
                    {board.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <DateTimePicker
              label="Schedule Date & Time"
              value={formData.scheduledAt}
              onChange={(newValue) => newValue && setFormData({ ...formData, scheduledAt: newValue })}
              sx={{ mt: 2, width: '100%' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreatePin} variant="contained">
            Create Pin
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
