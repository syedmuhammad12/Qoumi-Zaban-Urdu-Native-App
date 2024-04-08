import React, { useRef, useEffect, useState } from 'react';
import { StyleSheet, View, Text, Image, Animated, TouchableOpacity, BackHandler } from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import axios from 'axios';
import Spinner from 'react-native-loading-spinner-overlay';
import Toast from 'react-native-simple-toast';
import ImgToBase64 from 'react-native-image-base64';
import { useFocusEffect } from "@react-navigation/native"
import RNFetchBlob from 'rn-fetch-blob';
import DocumentScanner from 'react-native-document-scanner-plugin'
import RNExitApp from 'react-native-exit-app';
// import jscanify from 'jscanify'

// let API_URL = "https://d395b1fe2f7bd4aa89b4bc6eea6f05d75.clg07azjl.paperspacegradient.com/";
let API_URL = "https://3132-111-68-110-251.ngrok-free.app/";
const MainScreen = ({ navigation }) => {

  // const scanner = new jscanify();

  const fadeInFromTopAnimation = useRef(new Animated.Value(0)).current;

  // Animated values for each logo
  const fadeInFromLeft = useRef(new Animated.Value(0)).current;
  const fadeInFromBottom = useRef(new Animated.Value(0)).current;
  const fadeInFromRight = useRef(new Animated.Value(0)).current;

  const [spinner_handler, setSpinnerHandler] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dialog_title, setDialogTitle] = useState("Inappropriate Image");
  const [dialog_message, setDialogMessage] = useState("Kindly select the appropriate Image for the OCR");

  useEffect(() => {
    Animated.timing(fadeInFromTopAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [fadeInFromTopAnimation]);

  // Logo ANimation configuration
  const animateLogo = (animatedValue, fromValue, toValue, duration) => {
    return Animated.timing(animatedValue, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    });
  };

    // Logo useEffect to trigger animations
    useEffect(() => {
      Animated.parallel([
        animateLogo(fadeInFromLeft, -100, 0, 1000),  // Pan in from left
        animateLogo(fadeInFromBottom, 100, 0, 1000), // Pan in from bottom
        animateLogo(fadeInFromRight, 100, 0, 1000),  // Pan in from right
      ]).start();
    }, [fadeInFromLeft, fadeInFromBottom, fadeInFromRight]);

  let oncePressed = false;
  const duration_exit = 3 * 1000;
  useFocusEffect(
    React.useCallback(() => {
      
      const onBackPress = () => {
        if(oncePressed){
          oncePressed = false;
          RNExitApp.exitApp();
          // return
        }else{
            Toast.show("Press again to exit", duration_exit, Toast.TOP);
            oncePressed = true
            setTimeout(() => BackHandler.addEventListener('hardwareBackPress', () => {
                  oncePressed = false
            }), 
            duration_exit);
        }
        
        return true
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
      {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
        oncePressed = false;
      } 
    }, []),
  );

  // Logo useEffect to trigger animations
  // useEffect(() => {
    
  //   // let oncePressed = false;
  //   // const duration_exit = 3 * 1000;
    
  //   BackHandler.addEventListener('hardwareBackPress', () => {
  //       if(oncePressed){
  //           oncePressed = false;
  //           BackHandler.exitApp();
  //       }else{
  //           Toast.show("Press again to exit", duration_exit, Toast.TOP);
  //           oncePressed = true
  //           setTimeout(() => BackHandler.removeEventListener('hardwareBackPress', () => {
  //                 oncePressed = true
  //           }), 
  //           duration_exit);
  //       }
  //   });

  // }, []);



  async function  detect_image(base_image){
    setSpinnerHandler(true);
    let data = {file: base_image}
    await axios.post( API_URL + "detection", data)
    .then(function (response) {
      // handle success
      if (response.data.limit == "appropriate"){

        setSpinnerHandler(false);
        navigation.navigate('ImagePreview', {MainImage: base_image, UserId: response.data.user_id, MyData: response.data.my_data});
      }
      else{
        console.log("Image is Not Compataible")
        setSpinnerHandler(false);
        setVisible(true)
        
      }

    })
    .catch(function (error) {
      // handle error
      console.log(error)
      setSpinnerHandler(false);
      Toast.show(error.message, Toast.LONG);
      
    })


  }

  // function camera_cap(){

  //   ImagePicker.openCamera({
  //     includeBase64: true,
  //     freeStyleCropEnabled: true,
  //     cropping: true,
  //   }).then(image => {
  //     if (image){
        
  //       let base_64_data = `data:${image.mime};base64,${image.data}`;
  //       detect_image(base_64_data);

  //     }
  //   }).catch(function (error) {
  //     // handle error
  //     console.log(error)
  //     Toast.show(error.message, Toast.LONG)
  //   });

  // }

  async function camera_cap(){

    // ImagePicker.openCamera({
    //   includeBase64: true,
    //   freeStyleCropEnabled: true,
    //   cropping: true,
    // }).then(image => {
    //   if (image){
        
    //     let base_64_data = `data:${image.mime};base64,${image.data}`;
    //     detect_image(base_64_data);

    //   }
    // }).catch(function (error) {
    //   // handle error
    //   console.log(error)
    //   Toast.show(error.message, Toast.LONG)
    // });

    const { scannedImages } = await DocumentScanner.scanDocument({
      maxNumDocuments: 1,
      responseType: 'base64',

    })

    if (scannedImages.length > 0) {
      // set the img src, so we can view the first scanned image
      // console.log(scannedImages[0]);
      let base_64_data = `data:image/png;base64,${scannedImages[0]}`;
      detect_image(base_64_data);

    }
    else{
      Toast.show("User cancelled image selection", Toast.LONG)
    }

  }

  function gallery_sel(){

    ImagePicker.openPicker({
      includeBase64: true,
      freeStyleCropEnabled: true,
      cropping: true,
    }).then(image => {
      if (image){
        
        let base_64_data = `data:${image.mime};base64,${image.data}`;
        detect_image(base_64_data);

      }
    }).catch(function (error) {
      // handle error
      console.log(error)
      Toast.show(error.message, Toast.LONG)
    });

  }

  async function available_image_sel(image){
    
    // const DEFAULT_IMAGE = Image.resolveAssetSource(image).uri;
    // ImgToBase64.getBase64String(DEFAULT_IMAGE)
    // .then((base64String) => {
    //   let base_64_data = `data:image/png;base64,${base64String}`;
    //   detect_image(base_64_data);
    // })
    // .catch((err) => {
    //   console.log(err);
    //   Toast.show(err.message, Toast.LONG);
    // });
    setSpinnerHandler(true)
    RNFetchBlob.config({
      fileCache: true
    })
      .fetch("GET", image)

      .then(resp => {
        // imagePath = resp.path();
        // console.log(resp)

        return resp.readFile("base64");
      })
      .then(base64Data => {
        let base_64_data = `data:image/png;base64,${base64Data}`;
        detect_image(base_64_data);
        // navigation.navigate('ImagePreview', {image: base_64_data})
        // console.log(base64Data);

        // return fs.unlink(imagePath);
      });
    
  }



  return (
    <View style={styles.container}>
      
      <Spinner
          visible={spinner_handler}
          textContent={'Processing Image'}
          color='white'
          textStyle={{textShadowColor: "white", color:"white"}}
        />
      
      {/* Animated Image at top center */}
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: fadeInFromTopAnimation, transform: [{
              translateY: fadeInFromTopAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0], // Adjust the initial translateY value as needed
              })
            }]
          },
        ]}
      >
        <Image
          source={require('./../../assets/images/dashboard_image_new.png')}
          style={styles.image}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Dotted box with white content */}
      <View style={styles.dottedBox}>
        <View style={styles.innerBox}>

          {/* First row */}
          <View style={styles.imageRow}>
            {/* First Image */}
            <View style={styles.imageColumn} >
              <TouchableOpacity onPress={() => {camera_cap()}}>
                <Image
                  source={require('./../../assets/images/frame_camera.png')}
                  style={styles.innerImageFirstRow}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text
                
                style={styles.imageText}
              >
             Capture   
              </Text>
            </View>

            {/* Second Image */}
            <View style={styles.imageColumn} >
              <TouchableOpacity onPress={() => {gallery_sel()}}>
                <Image
                  source={require('./../../assets/images/frame_gallery.png')}
                  style={styles.innerImageFirstRow}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              <Text
              
                style={styles.imageText}
              >
                Gallery
              </Text>
            </View>
          </View>

          {/* Second row */}
          <View style={{ alignItems: 'center', marginTop: 15 }}>
            <Text style={{ fontSize: 14, fontFamily: 'Inter', fontWeight: '400', color: '#000000' }}>Dont have an image? Try these.</Text>
          </View>

          {/* Third row */}
          <View style={styles.imageRow}>
            <TouchableOpacity onPress={() => {available_image_sel('https://res.cloudinary.com/dbebwo8jx/image/upload/v1708110710/rynwxty7kqdyba0xuxcr.jpg')}}>
              <Image
                source={require("./../../assets/images/suggest_first.jpg")}
                style={styles.innerImageThirdRow}
                resizeMode="contain"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => {available_image_sel('https://res.cloudinary.com/dbebwo8jx/image/upload/v1708110710/ihnvuujjdzpwuaishdtj.jpg')}}>
              <Image
                source={require("./../../assets/images/suggest_second.jpg")}
                style={styles.innerImageThirdRow}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          {/* Fourth row */}
          <View style={styles.imageRow}>
            {/* First Logo */}
            <Animated.Image
              source={require('./../../assets/images/neduet_logo.png')}
              style={[
                styles.innerImageFourthRow,
                {
                  opacity: fadeInFromLeft, transform: [{
                    translateX: fadeInFromLeft.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0],
                    })
                  }]
                },
              ]}
              resizeMode="contain"
              contentFit={'contain'}
            />

            {/* Second Logo */}
            <Animated.Image
              source={require('./../../assets/images/ncl_logo.png')}
              style={[
                styles.innerImageFourthRow,
                {
                  opacity: fadeInFromBottom, transform: [{
                    translateY: fadeInFromBottom.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })
                  }]
                },
              ]}
              resizeMode="contain"
              contentFit={'contain'}
              
            />

            {/* Third Logo */}
            <Animated.Image
              source={require('./../../assets/images/atup_logo.png')}
              style={[
                styles.innerImageFourthRow,
                {
                  opacity: fadeInFromRight, transform: [{
                    translateX: fadeInFromRight.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    })
                  }]
                },
              ]}
              resizeMode="contain"
              contentFit={'contain'}
            />

          </View>

        </View>
      </View>
    </View >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DEF9FF',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dottedBox: {
    flex: 3,
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    backgroundColor: '#F0FCFF',
    width: '95%',
    height: '97%',
    borderRadius: 16,
    padding: 15,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  imageColumn: {
    alignItems: 'center',
  },
  innerImageFirstRow: {
    width: 120,
    height: 100,
    margin: 10,
  },
  imageText: {
    fontSize: 18,
    fontFamily: 'Inter',
    fontWeight: '400',
    color: '#000000',
  },
  innerImageThirdRow: {
    width: 140,
    height: 200,
    marginHorizontal: 10,
  },
  innerImageFourthRow: {
    width: 75,
    height: 75,
    marginHorizontal: 10,
    flex: 1,
    resizeMode: 'contain',
  }
});

export default MainScreen


