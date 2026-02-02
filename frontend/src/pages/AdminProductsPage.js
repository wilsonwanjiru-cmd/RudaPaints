import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Snackbar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { productsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const [paints, setPaints] = useState([]);
  const [filteredPaints, setFilteredPaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPaint, setSelectedPaint] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Interior',
    brand: 'Ruda Paints',
    size: '4L',
    price: '',
    originalPrice: '',
    description: '',
    features: '',
    available: true,
    featured: false,
    isNew: false,
    rating: 0,
    reviewCount: 0,
    image: null,
  });

  useEffect(() => {
    // Check if admin is logged in
    const isAdmin = localStorage.getItem('rudapaints_admin');
    if (!isAdmin) {
      navigate('/admin');
      return;
    }
    
    fetchPaints();
  }, [navigate]);

  useEffect(() => {
    filterPaints();
  }, [paints, searchTerm, categoryFilter]);

  const fetchPaints = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setPaints(response.data);
      setFilteredPaints(response.data);
    } catch (err) {
      setError('Failed to fetch paints. Please try again later.');
      console.error('Error fetching paints:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterPaints = () => {
    let filtered = paints;

    if (searchTerm) {
      filtered = filtered.filter(paint =>
        paint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paint.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        paint.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(paint => paint.category === categoryFilter);
    }

    setFilteredPaints(filtered);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  const handleCreatePaint = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('brand', formData.brand);
      formDataToSend.append('size', formData.size);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('originalPrice', formData.originalPrice);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('features', formData.features);
      formDataToSend.append('available', formData.available);
      formDataToSend.append('featured', formData.featured);
      formDataToSend.append('isNew', formData.isNew);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await productsAPI.create(formDataToSend);
      setSuccess('Paint created successfully!');
      setDialogOpen(false);
      resetForm();
      fetchPaints();
    } catch (err) {
      setError('Failed to create paint. Please try again.');
      console.error('Error creating paint:', err);
    }
  };

  const handleUpdatePaint = async () => {
    if (!selectedPaint) return;

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name || selectedPaint.name);
      formDataToSend.append('category', formData.category || selectedPaint.category);
      formDataToSend.append('brand', formData.brand || selectedPaint.brand);
      formDataToSend.append('size', formData.size || selectedPaint.size);
      formDataToSend.append('price', formData.price || selectedPaint.price);
      formDataToSend.append('originalPrice', formData.originalPrice || selectedPaint.originalPrice);
      formDataToSend.append('description', formData.description || selectedPaint.description);
      formDataToSend.append('features', formData.features || selectedPaint.features?.join(','));
      formDataToSend.append('available', formData.available);
      formDataToSend.append('featured', formData.featured);
      formDataToSend.append('isNew', formData.isNew);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await productsAPI.update(selectedPaint._id, formDataToSend);
      setSuccess('Paint updated successfully!');
      setDialogOpen(false);
      setSelectedPaint(null);
      resetForm();
      fetchPaints();
    } catch (err) {
      setError('Failed to update paint. Please try again.');
      console.error('Error updating paint:', err);
    }
  };

  const handleDeletePaint = async (id) => {
    if (window.confirm('Are you sure you want to delete this paint? This action cannot be undone.')) {
      try {
        await productsAPI.delete(id);
        setSuccess('Paint deleted successfully!');
        fetchPaints();
      } catch (err) {
        setError('Failed to delete paint. Please try again.');
        console.error('Error deleting paint:', err);
      }
    }
  };

  const handleToggleFeatured = async (id, currentFeatured) => {
    try {
      await productsAPI.update(id, { featured: !currentFeatured });
      setSuccess(`Paint ${!currentFeatured ? 'added to' : 'removed from'} featured!`);
      fetchPaints();
    } catch (err) {
      setError('Failed to update paint. Please try again.');
      console.error('Error updating paint:', err);
    }
  };

  const handleToggleAvailability = async (id, currentAvailable) => {
    try {
      await productsAPI.update(id, { available: !currentAvailable });
      setSuccess(`Paint marked as ${!currentAvailable ? 'available' : 'out of stock'}!`);
      fetchPaints();
    } catch (err) {
      setError('Failed to update paint. Please try again.');
      console.error('Error updating paint:', err);
    }
  };

  const openCreateDialog = () => {
    setSelectedPaint(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (paint) => {
    setSelectedPaint(paint);
    setFormData({
      name: paint.name,
      category: paint.category,
      brand: paint.brand,
      size: paint.size,
      price: paint.price.toString(),
      originalPrice: paint.originalPrice?.toString() || '',
      description: paint.description || '',
      features: paint.features?.join(',') || '',
      available: paint.available,
      featured: paint.featured || false,
      isNew: paint.isNew || false,
      rating: paint.rating || 0,
      reviewCount: paint.reviewCount || 0,
      image: null,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Interior',
      brand: 'Ruda Paints',
      size: '4L',
      price: '',
      originalPrice: '',
      description: '',
      features: '',
      available: true,
      featured: false,
      isNew: false,
      rating: 0,
      reviewCount: 0,
      image: null,
    });
  };

  const handleFileChange = (event) => {
    setFormData({
      ...formData,
      image: event.target.files[0],
    });
  };

  const categories = ['all', 'Interior', 'Exterior', 'Primer', 'Varnish', 'Enamel', 'Others'];
  const sizes = ['1L', '4L', '5L', '10L', '20L'];

  const handleLogout = () => {
    localStorage.removeItem('rudapaints_admin');
    localStorage.removeItem('admin_email');
    navigate('/');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Admin Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 4,
        p: 3,
        bgcolor: 'primary.main',
        color: 'white',
        borderRadius: 2
      }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Product Management
          </Typography>
          <Typography variant="body2">
            Total Products: {paints.length} | Available: {paints.filter(p => p.available).length}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={openCreateDialog}
            sx={{ fontWeight: 'bold' }}
          >
            Add New Product
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ 
        mb: 4, 
        display: 'flex', 
        gap: 2, 
        flexWrap: 'wrap',
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1
      }}>
        <TextField
          placeholder="Search products..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Filter by Category"
            onChange={handleCategoryChange}
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Products Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'primary.main' }}>
            <TableRow>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Product</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Price</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Featured</TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredPaints.map((paint) => (
              <TableRow key={paint._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {paint.image && (
                      <img 
                        src={`http://localhost:5000${paint.image}`} 
                        alt={paint.name}
                        style={{ 
                          width: 50, 
                          height: 50, 
                          objectFit: 'contain',
                          marginRight: 12,
                          borderRadius: 4
                        }}
                      />
                    )}
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {paint.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {paint.brand} • {paint.size}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={paint.category} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    KES {paint.price.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title={paint.available ? "Mark as Out of Stock" : "Mark as Available"}>
                    <Switch
                      checked={paint.available}
                      onChange={() => handleToggleAvailability(paint._id, paint.available)}
                      color="success"
                      size="small"
                    />
                  </Tooltip>
                  <Typography variant="caption" sx={{ ml: 1 }}>
                    {paint.available ? 'In Stock' : 'Out of Stock'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Tooltip title={paint.featured ? "Remove from Featured" : "Add to Featured"}>
                    <IconButton 
                      onClick={() => handleToggleFeatured(paint._id, paint.featured)}
                      size="small"
                    >
                      {paint.featured ? (
                        <StarIcon sx={{ color: 'warning.main' }} />
                      ) : (
                        <StarBorderIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Edit">
                      <IconButton
                        color="primary"
                        size="small"
                        onClick={() => openEditDialog(paint)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDeletePaint(paint._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedPaint ? 'Edit Product' : 'Add New Product'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ pt: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <MenuItem value="Interior">Interior</MenuItem>
                  <MenuItem value="Exterior">Exterior</MenuItem>
                  <MenuItem value="Primer">Primer</MenuItem>
                  <MenuItem value="Varnish">Varnish</MenuItem>
                  <MenuItem value="Enamel">Enamel</MenuItem>
                  <MenuItem value="Others">Others</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Brand"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Size</InputLabel>
                <Select
                  value={formData.size}
                  label="Size"
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                >
                  {sizes.map((size) => (
                    <MenuItem key={size} value={size}>{size}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Current Price (KES)"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                fullWidth
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Original Price (KES)"
                type="number"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                fullWidth
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Features (comma separated)"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                fullWidth
                placeholder="e.g., Washable, Low VOC, Quick Drying, Odor Free"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select
                  value={formData.available}
                  label="Availability"
                  onChange={(e) => setFormData({ ...formData, available: e.target.value })}
                >
                  <MenuItem value={true}>In Stock</MenuItem>
                  <MenuItem value={false}>Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Featured</InputLabel>
                <Select
                  value={formData.featured}
                  label="Featured"
                  onChange={(e) => setFormData({ ...formData, featured: e.target.value })}
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>New Product</InputLabel>
                <Select
                  value={formData.isNew}
                  label="New Product"
                  onChange={(e) => setFormData({ ...formData, isNew: e.target.value })}
                >
                  <MenuItem value={true}>Yes</MenuItem>
                  <MenuItem value={false}>No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Product Image
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ marginTop: '8px', width: '100%' }}
                />
                {formData.image && (
                  <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 1 }}>
                    Selected: {formData.image.name}
                  </Typography>
                )}
                {selectedPaint?.image && !formData.image && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Current: {selectedPaint.image.split('/').pop()}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={selectedPaint ? handleUpdatePaint : handleCreatePaint}
            disabled={!formData.name || !formData.price}
          >
            {selectedPaint ? 'Update Product' : 'Create Product'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProductsPage;