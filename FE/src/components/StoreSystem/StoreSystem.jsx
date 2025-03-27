import { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import styles from './styles.module.scss';

const StoreSystem = () => {
  const [selectedStore, setSelectedStore] = useState(null);

  const stores = [
    {
      id: 1,
      name: 'TIRA Flagship Store',
      address: '123 Main Street, City Center, Metropolitan Area',
      phone: '+84 (0) 123 456 789',
      lat: 10.762622,
      lng: 106.660172
    },
    {
      id: 2,
      name: 'TIRA Outlet Store',
      address: '456 Fashion Avenue, Shopping District, Urban Zone',
      phone: '+84 (0) 987 654 321',
      lat: 10.770941, 
      lng: 106.689415
    }
  ];

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '12px'
  };

  const defaultCenter = {
    lat: 10.762622,
    lng: 106.660172
  };

  return (
    <div className={styles.storeSystem}>
      <div className={styles.storeContainer}>
        <div className={styles.storeList}>
          <h1>Our Stores</h1>
          {stores.map((store) => (
            <div 
              key={store.id} 
              className={`${styles.storeCard} ${selectedStore === store.id ? styles.active : ''}`}
              onClick={() => setSelectedStore(store.id)}
            >
              <h2>{store.name}</h2>
              <p><strong>Address:</strong> {store.address}</p>
              <p><strong>Phone:</strong> {store.phone}</p>
            </div>
          ))}
        </div>
        
        <div className={styles.mapContainer}>
          <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={selectedStore 
                ? stores.find(store => store.id === selectedStore) 
                : defaultCenter
              }
              zoom={15}
            >
              {stores.map((store) => (
                <Marker
                  key={store.id}
                  position={{ lat: store.lat, lng: store.lng }}
                  title={store.name}
                  onClick={() => setSelectedStore(store.id)}
                />
              ))}
            </GoogleMap>
          </LoadScript>
        </div>
      </div>
    </div>
  );
};

export default StoreSystem;