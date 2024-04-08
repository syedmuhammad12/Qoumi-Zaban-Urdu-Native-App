import React, {useState, useEffect} from 'react'
import { StyleSheet, View, Text, Image, TouchableOpacity, TextInput, BackHandler, ScrollView, I18nManager, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useRoute, useFocusEffect } from "@react-navigation/native"
import Sound from 'react-native-sound';
import Toast from 'react-native-simple-toast';
import RNFS from 'react-native-fs';
import Clipboard from '@react-native-clipboard/clipboard';
import Dialog from "react-native-dialog";
import RNExitApp from 'react-native-exit-app';

var sound = null;
const ExtractedText = ({navigation}) => {

  const route_data = useRoute()
  const audio_path = RNFS.TemporaryDirectoryPath + `/generated_audio_dastaan.mp3`;
  I18nManager.allowRTL(true);
  function play_audio(){
    if (!is_playing){
      sound.play()
      setIsPlaying(true);
    }
    else{
      Toast.show('Sound already playing', Toast.LONG)
    }
  }

  function pause_audio(){
    if (is_playing){
      sound.pause()
      setIsPlaying(false);
    }
    else{
      Toast.show('Sound already paused', Toast.LONG)
    }
  }


  const [text, setText] = useState('');
  const [is_playing, setIsPlaying] = useState(false);
  const [visible_exit, setVisibleExit] = useState(false);
  const [visible_home, setVisibleHome] = useState(false);

  function initializeSound(){
    sound = new Sound(audio_path, '', (error) => {
      if (error) {
        console.error('Error playing audio:', error);
        return;
      }
    });
    sound.setNumberOfLoops(-1);
  }

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        setVisibleHome(true)
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, []),
  );
  
  useEffect( () => {
    
  setText(route_data.params?.generated_text);
  RNFS.writeFile(audio_path, route_data.params?.audio_file, 'base64').then(()=>{initializeSound()});

  }, []);

  function download_file(){
    const min = 1;
    const max = 99999;
    const rand = Math.floor(min + Math.random() * (max - min));
    var path_txt_file = RNFS.DownloadDirectoryPath + '/UrduText_'+rand+'.txt';
    RNFS.writeFile(path_txt_file, text, 'utf8')
    .then((success) => {
      console.log('FILE WRITTEN!');
      Toast.show('File Saved in Downloads', Toast.LONG)
    })
    .catch((err) => {
      console.log(err.message);
      Toast.show('File Error', Toast.LONG)
    });
  }
  
  return (
    <View style={styles.container}>
      <Dialog.Container visible={visible_exit}>
        <Dialog.Title>Exit Program</Dialog.Title>
        <Dialog.Description>
          Do you want to exit this application?
        </Dialog.Description>
        <Dialog.Button label="Cancel" onPress={() => {setVisibleExit(false)}} />
        <Dialog.Button label="Exit" onPress={() => {RNExitApp.exitApp(); setVisibleExit(false)}} />
      </Dialog.Container>
      <Dialog.Container visible={visible_home}>
        <Dialog.Title>Home Screen</Dialog.Title>
        <Dialog.Description>
          Do you want to go back to home screen? your results will lost.
        </Dialog.Description>
        <Dialog.Button label="Cancel" onPress={() => {setVisibleHome(false)}} />
        <Dialog.Button label="Yes" onPress={() => {navigation.navigate('MainScreen')}} />
      </Dialog.Container>
      {/* Dotted box with white content */}
      <View style={styles.dottedBox}>
         
        <View style={styles.innerBox}>

          <View style={{ alignItems: 'center', marginTop: 15, marginBottom: 15 }}>
            <ScrollView showsHorizontalScrollIndicator={true}>
              <Text style={{ fontSize: 18, fontFamily: 'Inter', fontWeight: '400', color: '#000000'}}>Image Preview</Text>
            </ScrollView>
          </View>
          <SafeAreaView> 
            <View style={styles.innerInnerBox}>

              <View style={styles.innerTextContainer}>
                <TextInput
                  style={styles.previewText}
                  value={text}
                  multiline
                  scrollEnabled={true}
                  spellCheck={false}
                  autoCorrect={false}
                  showSoftInputOnFocus={false}
                />
              </View>

              <View style={{display: 'flex', flexDirection: 'column'}}>
                <View style={styles.buttonRow}>
                  <TouchableOpacity style={styles.button} onPress={()=>{Clipboard.setString(text)}}>
                    <Text style={styles.buttonText}>Copy Text</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.button} onPress={()=>{download_file()}}>
                    <Text style={styles.buttonText}>Download</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.buttonContainer}>
                  <View style={styles.buttonTextAudio}>
                    <Text style={styles.buttonText}>Text Audio</Text>
                    <View style={styles.playPauseContainer}>
                      <TouchableOpacity style={styles.playPauseButton} onPress={() => {play_audio()}}>
                        {/* Your Play Icon */}
                        <Icon name="play-circle" size={25} color="#FFFFFF" />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.playPauseButton} onPress={() => {pause_audio()}}>
                        {/* Your Pause Icon */}
                        <Icon name="pause-circle" size={25} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>


                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={styles.buttonFirst}
                    onPress={()=> setVisibleHome(true)}
                    >
                    <Image
                      source={require('./../../assets/images/button_home.png')}
                      style={styles.buttonImageFirst}
                      resizeMode="contain"
                    />
                    <Text style={styles.buttonTextFirst}>Home</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.buttonSecond}
                    onPress={()=> setVisibleExit(true)}
                    >
                    <Image
                      source={require('./../../assets/images/button_exit.png')}
                      style={styles.buttonImageSecond}
                      resizeMode="contain"
                    />
                    <Text style={styles.buttonTextSecond}>Exit</Text>
                  </TouchableOpacity>
                </View>

              </View>  
            </View>
          </SafeAreaView>
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
    height: '95%',
    borderRadius: 16,
    padding: 10,
  },
  innerTextContainer: {
    display: 'flex',
    backgroundColor: '#fff',
    height: 350,
    padding: 15,
    borderRadius: 16,
    flex: 1
  },
  previewText: {
    // width: '100%',
    color: '#000',
    fontFamily: 'JameelNoori',
    writingDirection: "rtl",
    fontSize: 17,
    // height: 420,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#7B7B7B',
    borderRadius: 10,
    padding: 7,
    width: '47%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '400',
    fontFamily: 'Inter',
  },
  buttonTextAudio: {
    backgroundColor: '#C1C1C1',
    borderRadius: 10,
    padding: 7,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  playPauseContainer: {
    flexDirection: 'row',
  },
  playPauseButton: {
    marginLeft: 5,
  },
  buttonFirst: {
    backgroundColor: '#7B7B7B',
    borderRadius: 10,
    padding: 7,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '47%',
    // marginTop: 10,
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
    padding: 7,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '47%',
    // marginTop: 10,
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

export default ExtractedText