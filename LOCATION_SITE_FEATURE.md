# Location & Site Management Feature - Asset Audit Platform

## 🗺️ Overview

The Asset Audit Platform now includes comprehensive location and site management capabilities, allowing organizations to track assets across multiple sites with precise location information and GPS coordinates.

## ✨ Features Added

### 1. **Site Management**
- ✅ **Site Model**: Complete site information with address, GPS coordinates, contact details
- ✅ **Site Types**: Office, Warehouse, Factory, Store, Branch, Data Center, Other
- ✅ **Site Hierarchy**: Organize assets by geographical locations
- ✅ **Operating Hours**: Track site-specific working hours and timezone
- ✅ **Contact Information**: Site managers, phone numbers, email addresses

### 2. **Location Management**
- ✅ **Location Model**: Granular location tracking within sites
- ✅ **Location Types**: Room, Floor, Building, Zone, Rack, Shelf, Desk, Storage
- ✅ **Hierarchical Structure**: Parent-child location relationships
- ✅ **Capacity Management**: Track location capacity and current asset count
- ✅ **Access Levels**: Public, Restricted, Secure, Classified
- ✅ **Environmental Conditions**: Temperature, humidity tracking

### 3. **GPS Integration**
- ✅ **Mobile GPS Capture**: Automatic GPS coordinates when taking photos
- ✅ **Location Permissions**: Proper permission handling for location access
- ✅ **Accuracy Tracking**: GPS accuracy information for quality control
- ✅ **Optional GPS**: Users can enable/disable GPS tracking per photo

### 4. **Enhanced Asset Tracking**
- ✅ **Site Assignment**: Assets linked to specific sites
- ✅ **Location Assignment**: Assets linked to specific locations within sites
- ✅ **Movement Tracking**: Track asset movements between sites and locations
- ✅ **Legacy Support**: Backward compatibility with existing location fields

## 🏗️ Database Schema

### **Sites Table**
```sql
CREATE TABLE Sites (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  type ENUM('Office', 'Warehouse', 'Factory', 'Store', 'Branch', 'Data Center', 'Other'),
  address TEXT,
  city VARCHAR(255),
  state VARCHAR(255),
  country VARCHAR(255),
  postalCode VARCHAR(20),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  contactPerson VARCHAR(255),
  contactPhone VARCHAR(50),
  contactEmail VARCHAR(255),
  description TEXT,
  isActive BOOLEAN DEFAULT true,
  timezone VARCHAR(50) DEFAULT 'UTC',
  operatingHours JSON,
  metadata JSON,
  createdBy UUID,
  updatedBy UUID,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP
);
```

### **Locations Table**
```sql
CREATE TABLE Locations (
  id UUID PRIMARY KEY,
  siteId UUID NOT NULL REFERENCES Sites(id),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) NOT NULL,
  type ENUM('Room', 'Floor', 'Building', 'Zone', 'Rack', 'Shelf', 'Desk', 'Storage', 'Other'),
  description TEXT,
  floor VARCHAR(50),
  room VARCHAR(50),
  zone VARCHAR(50),
  coordinates VARCHAR(100), -- Internal coordinates like "A1-B2"
  capacity INTEGER,
  currentCount INTEGER DEFAULT 0,
  isActive BOOLEAN DEFAULT true,
  accessLevel ENUM('Public', 'Restricted', 'Secure', 'Classified'),
  parentLocationId UUID REFERENCES Locations(id),
  environmentalConditions JSON,
  metadata JSON,
  createdBy UUID,
  updatedBy UUID,
  createdAt TIMESTAMP,
  updatedAt TIMESTAMP,
  UNIQUE(siteId, code)
);
```

### **Enhanced Asset Model**
```sql
-- Added to existing Assets table
ALTER TABLE Assets ADD COLUMN siteId UUID REFERENCES Sites(id);
ALTER TABLE Assets ADD COLUMN locationId UUID REFERENCES Locations(id);
-- location field kept for backward compatibility
```

### **Enhanced Movement Model**
```sql
-- Added to existing Movements table
ALTER TABLE Movements ADD COLUMN fromSiteId UUID REFERENCES Sites(id);
ALTER TABLE Movements ADD COLUMN toSiteId UUID REFERENCES Sites(id);
ALTER TABLE Movements ADD COLUMN fromLocationId UUID REFERENCES Locations(id);
ALTER TABLE Movements ADD COLUMN toLocationId UUID REFERENCES Locations(id);
-- fromLocation and toLocation fields kept for backward compatibility
```

## 🔧 API Endpoints

### **Sites API**
```http
GET    /api/sites              # List all sites with filtering
GET    /api/sites/types        # Get available site types
GET    /api/sites/:id          # Get site details
POST   /api/sites              # Create new site
PUT    /api/sites/:id          # Update site
DELETE /api/sites/:id          # Delete site
```

### **Locations API**
```http
GET    /api/locations          # List all locations with filtering
GET    /api/locations/types    # Get available location types
GET    /api/locations/site/:siteId  # Get locations for specific site
GET    /api/locations/:id      # Get location details
POST   /api/locations          # Create new location
PUT    /api/locations/:id      # Update location
DELETE /api/locations/:id      # Delete location
```

## 📱 Mobile Features

### **GPS Photo Tagging**
- **Automatic Location**: GPS coordinates captured with each photo
- **Permission Handling**: Proper location permission requests
- **Accuracy Display**: Shows GPS accuracy (±meters)
- **Optional GPS**: Toggle to enable/disable GPS per photo
- **Location Refresh**: Manual refresh button for updated coordinates

### **Location UI Components**
```jsx
// Location Card in Photo Capture
<Card style={styles.locationCard}>
  <Card.Content>
    <View style={styles.locationHeader}>
      <Text>Location Information</Text>
      <Switch value={locationEnabled} onValueChange={setLocationEnabled} />
    </View>
    
    {location && (
      <Chip icon="map-marker">
        {`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`}
      </Chip>
    )}
    
    <Text>Accuracy: ±{Math.round(location.accuracy)}m</Text>
  </Card.Content>
</Card>
```

## 🌐 Web Application Features

### **Site Management Interface**
- **Site List**: Grid view with search, filtering, and sorting
- **Site Details**: Comprehensive site information display
- **Site Form**: Create/edit sites with all fields
- **Location Management**: Manage locations within each site
- **Asset Assignment**: Assign assets to sites and locations

### **Location Hierarchy**
- **Tree View**: Hierarchical location display
- **Drag & Drop**: Move assets between locations
- **Capacity Tracking**: Visual indicators for location capacity
- **Search & Filter**: Find locations by various criteria

## 🎯 Use Cases

### **Multi-Site Organizations**
```javascript
// Example: Retail chain with multiple stores
const sites = [
  {
    name: "Downtown Store",
    code: "DS001",
    type: "Store",
    address: "123 Main St, Downtown",
    locations: [
      { name: "Sales Floor", type: "Zone" },
      { name: "Storage Room", type: "Storage" },
      { name: "Office", type: "Room" }
    ]
  },
  {
    name: "Warehouse Center",
    code: "WH001", 
    type: "Warehouse",
    locations: [
      { name: "Receiving Dock", type: "Zone" },
      { name: "Rack A1", type: "Rack" },
      { name: "Rack A2", type: "Rack" }
    ]
  }
];
```

### **Data Center Management**
```javascript
// Example: Data center with precise location tracking
const dataCenterSite = {
  name: "Primary Data Center",
  code: "DC001",
  type: "Data Center",
  locations: [
    {
      name: "Server Room A",
      type: "Room",
      floor: "1",
      accessLevel: "Secure",
      environmentalConditions: {
        temperature: { min: 18, max: 24 },
        humidity: { min: 40, max: 60 }
      },
      childLocations: [
        { name: "Rack A1", type: "Rack", coordinates: "A1" },
        { name: "Rack A2", type: "Rack", coordinates: "A2" }
      ]
    }
  ]
};
```

### **Office Building Management**
```javascript
// Example: Multi-floor office building
const officeBuilding = {
  name: "Corporate Headquarters",
  code: "HQ001",
  type: "Office",
  locations: [
    {
      name: "Floor 1",
      type: "Floor",
      childLocations: [
        { name: "Reception", type: "Zone" },
        { name: "Conference Room A", type: "Room" },
        { name: "IT Storage", type: "Storage" }
      ]
    },
    {
      name: "Floor 2", 
      type: "Floor",
      childLocations: [
        { name: "Open Office Area", type: "Zone" },
        { name: "Manager Offices", type: "Zone" }
      ]
    }
  ]
};
```

## 📊 Benefits

### **For Asset Managers**
- **Complete Visibility**: Know exactly where every asset is located
- **Efficient Planning**: Optimize asset distribution across sites
- **Compliance**: Meet regulatory requirements for asset tracking
- **Cost Control**: Reduce asset loss and improve utilization

### **For Field Workers**
- **GPS Accuracy**: Precise location data with every photo
- **Easy Navigation**: Find assets quickly using location hierarchy
- **Mobile Efficiency**: Capture location data automatically
- **Offline Support**: Location data cached for offline access

### **For Auditors**
- **Location Verification**: GPS coordinates verify asset locations
- **Audit Trail**: Complete movement history between sites/locations
- **Compliance Reports**: Generate location-based compliance reports
- **Data Integrity**: Accurate location data for audit purposes

## 🔍 Advanced Features

### **Location Analytics**
- **Utilization Reports**: Track location capacity usage
- **Movement Patterns**: Analyze asset movement between locations
- **Site Performance**: Compare asset efficiency across sites
- **Heat Maps**: Visual representation of asset density

### **Integration Capabilities**
- **Mapping Services**: Integration with Google Maps, OpenStreetMap
- **Building Management**: Connect with facility management systems
- **IoT Sensors**: Environmental monitoring integration
- **Access Control**: Integration with security systems

### **Mobile Enhancements**
- **Indoor Positioning**: Bluetooth beacons for indoor location
- **Augmented Reality**: AR overlays for location identification
- **Voice Commands**: Voice-activated location entry
- **Barcode Integration**: QR codes for quick location identification

## 🚀 Implementation Examples

### **Creating a Site with Locations**
```javascript
// Create site
const site = await siteApi.create({
  name: "Manufacturing Plant A",
  code: "MPA001",
  type: "Factory",
  address: "456 Industrial Blvd",
  city: "Manufacturing City",
  state: "State",
  country: "Country",
  latitude: 40.7128,
  longitude: -74.0060,
  contactPerson: "John Smith",
  contactPhone: "+1-555-0123",
  contactEmail: "john.smith@company.com"
});

// Create locations within the site
const locations = await Promise.all([
  locationApi.create({
    siteId: site.id,
    name: "Production Floor",
    code: "PF001",
    type: "Zone",
    capacity: 100
  }),
  locationApi.create({
    siteId: site.id,
    name: "Quality Control Lab",
    code: "QC001", 
    type: "Room",
    accessLevel: "Restricted"
  }),
  locationApi.create({
    siteId: site.id,
    name: "Raw Materials Storage",
    code: "RMS001",
    type: "Storage",
    capacity: 500
  })
]);
```

### **Asset Movement Between Sites**
```javascript
// Move asset from one site to another
const movement = await movementApi.create({
  assetId: "asset-123",
  type: "Transfer",
  fromSiteId: "site-001",
  toSiteId: "site-002", 
  fromLocationId: "location-001",
  toLocationId: "location-002",
  reason: "Operational requirement",
  requestDate: new Date().toISOString()
});
```

### **GPS Photo with Location**
```javascript
// Mobile photo capture with GPS
const photoData = {
  photo: imageFile,
  assetId: "asset-123",
  description: "Asset condition check",
  gpsLatitude: 40.7128,
  gpsLongitude: -74.0060
};

const photo = await photoApi.upload(photoData);
```

## 📈 Future Enhancements

### **Planned Features**
1. **3D Location Mapping**: Interactive 3D site and location visualization
2. **Geofencing**: Automatic alerts when assets move outside designated areas
3. **Route Optimization**: Optimal paths for asset collection/delivery
4. **Predictive Analytics**: Predict asset movement patterns
5. **Integration APIs**: Connect with external mapping and facility systems

### **Advanced Location Features**
1. **Indoor Positioning Systems**: Precise indoor location tracking
2. **Environmental Monitoring**: Real-time temperature, humidity tracking
3. **Occupancy Sensors**: Track location usage and capacity
4. **Emergency Procedures**: Location-based emergency response plans

---

## 🎉 Conclusion

The Location & Site Management feature transforms the Asset Audit Platform into a comprehensive solution for multi-site organizations. With GPS integration, hierarchical location management, and detailed site information, organizations can now:

- **Track assets precisely** across multiple sites and locations
- **Capture GPS coordinates** automatically with mobile photo documentation
- **Manage complex hierarchies** of sites, buildings, floors, and rooms
- **Ensure compliance** with detailed location audit trails
- **Optimize operations** with location-based analytics and reporting

The feature is production-ready and fully integrated into all platform components (backend, web, mobile) with comprehensive APIs and user-friendly interfaces! 🗺️✨
