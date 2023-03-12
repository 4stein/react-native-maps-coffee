import React, {useState, useEffect} from 'react';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  PermissionsAndroid,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const App = () => {
  const [currentLongitude, setCurrentLongitude] = useState('');
  const [currentLatitude, setCurrentLatitude] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const [nearPlaces, setNearPlaces] = useState([]);

  const fetchMaps = async (latitude, longitude) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyCwgMrh1RAzTGN4Fkdsc_Z44Kt8CEwMFvQ&location=${latitude},${longitude}&keyword=coffee&language=en&radius=1000`,
      );

      const data = await res.json();

      setNearPlaces(data.results);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This App needs to Access your location',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getOneTimeLocation();
        } else {
          setLocationStatus('Permission Denied');
        }
      } catch (err) {
        console.warn(err);
      }
    };
    requestLocationPermission();
    return () => {
      Geolocation.clearWatch(watchID);
    };
  }, []);

  const getOneTimeLocation = () => {
    setLocationStatus('Getting Location ...');
    Geolocation.getCurrentPosition(
      position => {
        setLocationStatus('You are Here');

        const currentLongitude = JSON.stringify(position.coords.longitude);
        const currentLatitude = JSON.stringify(position.coords.latitude);

        setCurrentLongitude(currentLongitude);
        setCurrentLatitude(currentLatitude);
        fetchMaps(currentLatitude, currentLongitude);
      },
      error => {
        setLocationStatus(error.message);
      },
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 1000,
      },
    );
  };

  if (nearPlaces.length > 0) {
    return (
      <SafeAreaView style={{flex: 1}}>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: Number(currentLatitude),
              longitude: Number(currentLongitude),
              latitudeDelta: 0.015,
              longitudeDelta: 0.0121,
            }}
            showUserLocation={true}>
            {nearPlaces.map(place => (
              <Marker
                key={place.place_id}
                icon={place.icon}
                title={place.name}
                description={place.types
                  .toString()
                  .replaceAll('_', ' ')
                  .replaceAll(',', ', ')}
                pinColor={place.icon_background_color}
                coordinate={{
                  latitude: Number(place.geometry.location.lat),
                  longitude: Number(place.geometry.location.lng),
                }}
              />
            ))}
          </MapView>
        </View>
      </SafeAreaView>
    );
  } else {
    return (
      <View style={styles.container}>
        {locationStatus === 'Permission Denied' ? (
          <Text>Please give permission to your location</Text>
        ) : (
          <Text>Loading...</Text>
        )}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boldText: {
    fontSize: 25,
    color: 'red',
    marginVertical: 16,
    textAlign: 'center',
  },
  mapContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default App;
