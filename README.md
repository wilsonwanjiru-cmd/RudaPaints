# 🎨 Ruda Paints Enterprise - MERN Stack Website

![Ruda Paints Logo](https://img.shields.io/badge/Ruda-Paints-1976d2?style=for-the-badge)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-00d8ff?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

A modern, full-featured e-commerce website for Ruda Paints Enterprise built with the MERN stack (MongoDB, Express.js, React, Node.js). Display paints with prices, allow price list downloads, and enable customer engagement through multiple channels.

## 🌐 Live Demo
- **Website:** [rudapaintsenterprise.com](http://rudapaintsenterprise.com) (Coming Soon)
- **API:** [localhost:5000](http://localhost:5000) (Development)
- **Frontend:** [localhost:3000](http://localhost:3000) (Development)

## ✨ Features

### 🎨 Product Management
- Display paints with detailed information (name, category, brand, size, price)
- Product categorization (Interior, Exterior, Primer, Varnish, Enamel, Others)
- Product images upload and display
- Filter and search products
- Product availability tracking

### 📊 Price List System
- View price list on website
- Download price list in CSV format
- Download price list in Excel format
- Automatic grouping by categories
- Real-time price updates

### 📱 Customer Engagement
- WhatsApp integration for instant inquiries (0703538670)
- Email contact (rudapaints@gmail.com)
- Contact form with validation
- Responsive design for all devices

### 🔧 Technical Features
- Full CRUD operations for products
- RESTful API with proper status codes
- MongoDB Atlas cloud database
- Image upload with Multer
- Form validation and error handling
- CORS enabled for frontend-backend communication

## 🏗️ Architecture


## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB Atlas account or local MongoDB
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wilsonwanjiru-cmd/RudaPaints.git
   cd RudaPaints

# 📚 Ruda Paints Enterprise API Documentation

## Table of Contents
- [Authentication](#authentication)
- [Products API](#products-api)
- [Price List API](#price-list-api)
- [Health Check](#health-check)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## 📍 Base URL  http://localhost:5000/api 

## 🔐 Authentication
Currently, the API uses public endpoints. Future versions will implement JWT authentication.

## 🎨 Products API

### GET /paints
**Description:** Retrieve all paint products

**Parameters:** None

**Response:**
```json
[
  {
    "_id": "65a1b2c3d4e5f67890123456",
    "name": "Premium Interior Emulsion",
    "category": "Interior",
    "brand": "Ruda Paints",
    "size": "4L",
    "price": 4500,
    "description": "High-quality interior wall paint...",
    "features": ["Washable", "Low VOC", "Quick Drying"],
    "image": "/uploads/1234567890.jpg",
    "available": true,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
  