import { RNCamera } from 'react-native-camera';
import React, { Component } from 'react';
import {
  StyleSheet, View, Image, Dimensions, TouchableOpacity,
  Animated, AsyncStorage, Platform, Text, StatusBar, Linking
} from 'react-native';
import CameraRollPicker from 'react-native-camera-roll-picker';

class notAuthorizedView extends Component {
  
}


export default class Camera extends Component {
  constructor(props) {
    super(props);
    this.state = {
      flashMode: RNCamera.Constants.FlashMode.off,
      type: RNCamera.Constants.Type.back,
      isRecording: false,
      showGallery: false,
      num: 0,
      selected: [],
      active: false
    };
  }

  flipCamera() {
    let newType;
    const { back, front } = RNCamera.Constants.Type;

    if (this.state.type === back) {
      newType = front;
    } else if (this.state.type === front) {
      newType = back;
    }

    this.setState({ type: newType });
  }

  switchFlash() {
    let newFlashMode;
    const { on, off } = RNCamera.Constants.FlashMode;

    if (this.state.flashMode === on) {
      newFlashMode = off;
    } else if (this.state.flashMode === off) {
      newFlashMode = on;
    }

    this.setState({ flashMode: newFlashMode });
  }

  getSelectedImages(images, current) {
    var num = images.length;

    this.setState({
      num: num,
      selected: images,
    });

    var uri = this.state.selected[0].uri;
    setTimeout(() => this.props.previewTime(uri), 500);

  }

  toggleGallery() {
    this.setState({ showGallery: !this.state.showGallery })
  }

  activate() {
    this.setState({ active: 'true'})
  }


  render() {
    return (
      <View style={styles.container}>
        <StatusBar
          barStyle="light-content"
        />

        <RNCamera
          ref={ref => {
            this.camera = ref;
          }}
          style={styles.preview}
          autoFocus={RNCamera.Constants.AutoFocus.on}
          captureAudio={true}
          onCameraReady={() => this.activate()}
          videoStabilizationMode={Platform.OS === 'android' ? null : RNCamera.Constants.VideoStabilization['auto']}
          type={this.state.type}
          flashMode={this.state.flashMode}
          permissionDialogTitle={'Permission to use camera'}
          permissionDialogMessage={'PopTag needs your permission to use your camera.'}
          notAuthorizedView={
            <TouchableOpacity activeOpacity={1} onPress={() => Linking.openURL('app-settings:PopTag')}
            style={{ flex: 1, backgroundColor: '#4A90E2', justifyContent: 'center', alignItems: 'center' }}>
             <Text style={styles.mainText}>Tap to enable Camera and Microphone in Settings.</Text>
           </TouchableOpacity>}
        />

        <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center', }}>
          <TouchableOpacity
            onPress={this.state.active ? this.takePicture.bind(this) : null}
            onLongPress={this.state.active ? this.takeVideo.bind(this) : null}
            onPressOut={this.state.isRecording ? () => this.camera.stopRecording() : () => { }}
            style={styles.circlecell}>
            <Image source={{ uri: 'circle' }} style={styles.circle} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => this.props.toggleCamera()}
            style={styles.xcell}>
            <Image source={{ uri: 'x' }} style={styles.x} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={this.state.active ? () => this.toggleGallery() : null}
            style={styles.photoscell}>
            <Image source={{ uri: 'photos' }} style={styles.photos} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={this.state.active ? () => this.flipCamera() : null}
            style={styles.flipcameracell}>
            <Image source={{ uri: 'flipcamera' }} style={styles.flipcamera} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={this.state.active ? () => this.switchFlash() : null}
            style={styles.flashcell}>
            <Image source={{ uri: this.state.flashMode === RNCamera.Constants.FlashMode.on ? 'flash' : 'noflash' }} style={styles.flash} />
          </TouchableOpacity>
        </View>

        {
          this.state.showGallery ?
            <View style={styles.Gcontainer}>
              <TouchableOpacity style={styles.Gcontent} onPress={() => this.toggleGallery()}>
                <Image source={{ uri: 'x' }} style={styles.x} />
              </TouchableOpacity>
              <CameraRollPicker
                scrollRenderAheadDistance={500}
                initialListSize={1}
                pageSize={3}
                removeClippedSubviews={false}
                groupTypes='SavedPhotos'
                batchSize={5}
                maximum={3}
                selected={this.state.selected}
                assetType='photos'
                imagesPerRow={3}
                imageMargin={5}
                callback={this.getSelectedImages.bind(this)} />
            </View>
            : null
        }

      </View >
    );
  }

  takePicture = async function () {
    if (this.camera) {
      const options = { quality: 1, base64: true };
      const data = await this.camera.takePictureAsync(options)
      this.props.previewTime(data.uri);
    }
  };

  takeVideo = async function () {
    if (this.camera) {
      try {
        const options = { maxDuration: 60 };
        const promise = this.camera.recordAsync(options);

        if (promise) {
          this.setState({ isRecording: true });
          const data = await promise;
          this.setState({ isRecording: false });
          this.props.previewTime(data.uri);
        }
      } catch (e) {
        console.warn(e);
      }
    }
  };


}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    flexDirection: 'column',
    backgroundColor: 'black',
    paddingTop: Dimensions.get('window').height * 0.05,
    paddingBottom: Dimensions.get('window').height * 0.25,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  circlecell: {
    position: 'absolute',
    top: 20,
    alignSelf: 'center',
  },
  circle: {
    height: 65,
    width: 65,
    tintColor: 'white'
  },
  xcell: {
    position: 'absolute',
    top: 37.5,
    right: Dimensions.get('window').width / 2 + 125,
  },
  x: {
    height: 30,
    width: 30,
    tintColor: 'white'
  },
  photoscell: {
    position: 'absolute',
    top: 37.5,
    right: Dimensions.get('window').width / 2 + 60,
  },
  photos: {
    height: 30,
    width: 30,
    tintColor: 'white'
  },
  flipcameracell: {
    position: 'absolute',
    top: 37.5,
    left: Dimensions.get('window').width / 2 + 60,
  },
  flipcamera: {
    height: 30,
    width: 30,
    tintColor: 'white'
  },
  flashcell: {
    position: 'absolute',
    top: 37.5,
    left: Dimensions.get('window').width / 2 + 125,
  },
  flash: {
    height: 30,
    width: 30,
    tintColor: 'white'
  },
  Gcontainer: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    position: 'absolute',
    backgroundColor: '#4A90E2',
  },
  Gcontent: {
    marginTop: Dimensions.get('window').height * 0.04,
    height: Dimensions.get('window').height * 0.06,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  Gtext: {
    fontSize: 16,
    alignItems: 'center',
    color: '#fff',
  },
  Gbold: {
    fontWeight: 'bold',
  },
  mainText: {
      color: 'white',
      fontWeight: '600',
      textAlign: 'center',
      marginVertical: 11
  }
});
