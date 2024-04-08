import React, {useState, useEffect} from 'react'
import { StyleSheet, View, Text, Image, TouchableOpacity, BackHandler } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-simple-toast';
import { useRoute, useFocusEffect } from "@react-navigation/native"
import axios from 'axios';

const ImagePreview = ({ navigation }) => {
  // let API_URL = "https://d395b1fe2f7bd4aa89b4bc6eea6f05d75.clg07azjl.paperspacegradient.com/";
  let API_URL = "https://3132-111-68-110-251.ngrok-free.app/";
  const route_data = useRoute()
  
  const [spinner_handler, setSpinnerHandler] = useState(false);
  const [image, setImage] = useState();
  const [user_id, setUserId] = useState();
  const [image_data, setImageData] = useState();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('MainScreen')
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );

  useEffect(() => {

  setImage(route_data.params?.MainImage);
  setImageData(route_data.params?.MyData);
  setUserId(route_data.params?.UserId);
  

  }, []);

  async function  extractText(){
    setSpinnerHandler(true);
    let data = {user_id: user_id, my_data: JSON.stringify(image_data)}
    await axios.post( API_URL + "extraction", data)
    .then(function (response) {
      // handle success
        setSpinnerHandler(false);
        navigation.navigate('ExtractedText', {audio_file: response.data.audio_google, generated_text: response.data.generated_text})

    })
    .catch(function (error) {
      // handle error
      console.log(error)
      setSpinnerHandler(false);
      Toast.show(error.message, Toast.LONG);
      
    })


  }

  return (
    <View style={styles.container}>
      <Spinner
        visible={spinner_handler}
        textContent={'Extracting Text'}
      />
      {/* Dotted box with white content */}
      <View style={styles.dottedBox}>
        <View style={styles.innerBox}>

          <View style={{ alignItems: 'center', marginTop: 15, marginBottom: 15 }}>
            <Text style={{ fontSize: 18, fontFamily: 'Inter', fontWeight: '400', color: '#000000' }}>Image Preview</Text>
          </View>

          <View style={styles.innerInnerBox}>

            <View style={styles.previewImageContainer}>
              {image && <Image
                source={{uri: image}}
                style={styles.previewImage}
                alt={"showing image here from api "}
                resizeMode="contain"
              />}
            </View>

            {/* <View style={styles.previewImageContainer}>
              <Image
                source={require('./../../assets/images/imagepreviewscreen.png')}
                style={styles.previewImage}
                resizeMode="contain"
              />
            </View> */}



            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.buttonFirst}
                onPress={() => {
                  extractText();
                }}
              >
                <Image
                  source={require('./../../assets/images/button_get_text.png')}
                  style={styles.buttonImageFirst}
                  resizeMode="contain"
                />
                <Text style={styles.buttonTextFirst}>Get Text</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.buttonSecond}
                onPress={() => {
                  navigation.navigate('MainScreen')
                }}
              >
                <Image
                  source={require('./../../assets/images/button_cross.png')}
                  style={styles.buttonImageSecond}
                  resizeMode="contain"
                />
                <Text style={styles.buttonTextSecond}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DEF9FF',
  },
  dottedBox: {
    flex: 2,
    borderWidth: 3,
    borderStyle: 'dashed',
    borderRadius: 16,
    borderColor: '#FFFFFF',
    backgroundColor: '#DEF9FF',
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerBox: {
    backgroundColor: '#F0FCFF',
    width: '95%',
    height: '97%',
    borderRadius: 16,
    padding: 15,
  },
  innerInnerBox: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#DEF9FF',
    height: 100,
    borderRadius: 16,
    padding: 10,
  },
  previewImageContainer: {
    backgroundColor: '#fff',
    width: '100%',
    height: 400,
    // height: '100%',
    borderRadius: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  // previewImageContainer: {
  //   width: '100%',
  //   display: 'flex',
  //   alignItems: 'center',
  // },
  // previewImage: {
  //   width: 100,
  // },
  buttonContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  buttonFirst: {
    backgroundColor: '#7B7B7B',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonImageFirst: {
    marginRight: 10,
  },
  buttonTextFirst: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
    marginRight: 10,
  },
  buttonSecond: {
    backgroundColor: '#EF3B3B',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonImageSecond: {
    marginRight: 10,
  },
  buttonTextSecond: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
    marginRight: 10,
  }
});

export default ImagePreview