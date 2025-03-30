import { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import styles from './styles.module.scss';
import Footer from "../Footer/Footer";

const StoreSystem = () => {
  const [selectedStore, setSelectedStore] = useState(1); // Default to first store

  const stores = [
    {
      id: 1,
      name: 'TIRA Trinh Van Bo',
      address: '13 P. Trịnh Văn Bô, Xuân Phương, Nam Từ Liêm, Hà Nội, Việt Nam',
      phone: '+84 (0) 123 456 789',
      lat: 21.0381,  // Coordinates for Trinh Van Bo
      lng: 105.7478
    },
    {
      id: 2,
      name: 'TIRA Hoang Mai',
      address: '213 Đ. Hoàng Mai, Tương Mai, Hai Bà Trưng, Hà Nội 100000, Việt Nam',
      phone: '+84 (0) 987 654 321',
      lat: 20.9895,  // Coordinates for Hoang Mai
      lng: 105.8526
    }
  ];

  const mapContainerStyle = {
    width: '100%',
    height: '500px',
    borderRadius: '12px'
  };

  const defaultCenter = {
    lat: stores[0].lat,
    lng: stores[0].lng
  };

  const mapStyles = [
    {
      featureType: "all",
      elementType: "all",
      stylers: [
        { saturation: 20 },
        { lightness: 40 }
      ]
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [
        { hue: "#ff0000" },
        { saturation: -50 },
        { lightness: 20 }
      ]
    }
  ];

  const handleGetDirections = (store) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`;
    window.open(url, '_blank');
  };

  return (
    <> 
      <div className={styles.storeSystem}>
        <div className={styles.storeContainer}>
          <div className={styles.storeList}>
            <h1>Our Stores</h1>
            {stores.map((store) => (
              <div 
                key={store.id} 
                className={`${styles.storeCard} ${selectedStore === store.id ? styles.active : ''}`}
              >
                <h2>{store.name}</h2>
                <p><strong>Address:</strong> {store.address}</p>
                <p><strong>Phone:</strong> {store.phone}</p>
                <button 
                  className={styles.directionsButton}
                  onClick={() => {
                    setSelectedStore(store.id);
                    handleGetDirections(store);
                  }}
                >
                  Get Directions
                </button>
              </div>
            ))}
          </div>
          
          <div className={styles.mapContainer}>
            <LoadScript googleMapsApiKey="AIzaSyDJCpp0y_h740g1gUBrJFC-sJr_yJ8D21g">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={{
                  lat: stores.find(store => store.id === selectedStore).lat,
                  lng: stores.find(store => store.id === selectedStore).lng
                }}
                zoom={15}
                options={{
                  styles: mapStyles
                }}
              >
                {stores.map((store) => (
                  <Marker
                    key={store.id}
                    position={{ lat: store.lat, lng: store.lng }}
                    title={store.name}
                    onClick={() => setSelectedStore(store.id)}
                    icon={{
                      url: selectedStore === store.id 
                        ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
                        : "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                    }}
                  />
                ))}
              </GoogleMap>
            </LoadScript>
          </div>
        </div>
      </div>
      <Footer></Footer>
    </>
  );
};

export default StoreSystem;