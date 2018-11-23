import React, { Component } from 'react';
import {
    StyleSheet, View, Image, Dimensions, TouchableOpacity,
    Animated, AsyncStorage, Text, TextInput, Keyboard, Platform, FlatList,
    Linking, CameraRoll, ImageBackground, NativeModules, PermissionsAndroid
} from 'react-native';
import { shareOnFacebook, shareOnTwitter } from 'react-native-social-share';
import RNInstagramStoryShare from 'react-native-instagram-story-share';
import Spinner from 'react-native-loading-spinner-overlay';
import Camera from './Camera';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import ImageRotate from 'react-native-image-rotate';
import ImageResizer from 'react-native-image-resizer';
import Share from 'react-native-share';

const ipad = (Dimensions.get('window').height > 1020);
const iphonex = (Platform.OS === 'ios' && Dimensions.get('window').height > 800 && Dimensions.get('window').height < 1020);

var ReadImageData = NativeModules.ReadImageData;

export default class Challenge extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            rand: 0,
            preview: false,
            spinner: false,
            camera: false,
            uri: ''
        };
    }

    componentWillMount() {
        this.animatedValue = new Animated.Value(1);
        this.state.rand = Math.floor(Math.random() * this.props.challenges.length);
    }

    handlePressIn() {
        if (Platform.OS === 'ios') {
            Animated.spring(this.animatedValue, {
                toValue: 1.3
            }).start()
        }
        else {
            Animated.spring(this.animatedValue, {
                toValue: 1.1
            }).start()
        }
    }

    handlePressOut() {
        Animated.spring(this.animatedValue, {
            toValue: 1,
            friction: 5,
            tension: 5
        }).start();
    }

    shuffle(array) {

        var currentIndex = array.length, temporaryValue, randomIndex;

        // While there remain elements to shuffle...
        while (0 !== currentIndex) {

            // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }

        return array;

    }

    toggleCamera() {
        this.props.camera();
        this.setState({ camera: !this.state.camera });
    }

    togglePreview() {
        this.setState({ preview: !this.state.preview });
    }

    previewTime(uri) {
        this.setState({ uri: uri });
        this.toggleCamera();
        this.togglePreview();
        if (uri.indexOf('mov') !== -1 || uri.indexOf('MOV') !== -1 || uri.indexOf('mp4') !== -1) {
            if (Platform.OS == 'ios') {
                this.downloadVideo();
            }
            else {
                this.requestExternalStoragePermission('video');
            }
        }
        else {
            if (Platform.OS == 'ios') {
                this.downloadPhoto();
            }
            else {
                this.requestExternalStoragePermission('photo');
            }
        }
    }

    async requestExternalStoragePermission(type) {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Storage Permission',
                    message: 'PopTag saves your content to camera roll',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                if (type == 'video') {
                    this.downloadVideo();
                }
                else if (type == 'photo') {
                    this.downloadPhoto();
                }

            } else {
                console.log("Camera Roll permission denied")
            }
        } catch (err) {
            console.error('Failed to request permission ', err);
            return null;
        }
    };

    async insta() {
        if (Platform.OS == 'ios') {
            var uri = this.state.uri;

            if (uri.indexOf('assets-library') !== -1) {
                ReadImageData.readImage(uri, (imageBase64) => {
                    RNInstagramStoryShare.share({
                        backgroundImage: `data:image/png;base64,${imageBase64}`,
                        deeplinkingUrl: 'instagram-stories://share'
                    })
                        .then(() => console.log('SUCCESS'))
                        .catch(e => {
                            if (e.userInfo.NSLocalizedFailureReason == 'Not installed') {
                                Linking.openURL('itms-apps://itunes.apple.com/us/app/instagram/id389801252?mt=8');
                            }
                        })
                });
            }
            else {
                ImageResizer.createResizedImage(uri, 1920, 1080, 'JPEG', 100,
                    0, `${RNFS.DocumentDirectoryPath}`)
                    .then((success) => {
                        RNFS.readFile(success.path, 'base64').then((imageBase64) => {
                            RNInstagramStoryShare.share({
                                backgroundImage: `data:image/png;base64,${imageBase64}`,
                                deeplinkingUrl: 'instagram-stories://share'
                            })
                                .then(() => console.log('SUCCESS'))
                                .catch(e => {
                                    if (e.userInfo.NSLocalizedFailureReason == 'Not installed') {
                                        Linking.openURL('itms-apps://itunes.apple.com/us/app/instagram/id389801252?mt=8');
                                    }
                                })
                        })
                    })
            }
        }
        else {
            Linking.canOpenURL('instagram://story-camera').then(supported => {
                if (!supported) {
                    Linking.openURL('https://play.google.com/store/apps/details?id=com.instagram.android');
                } else {
                    return Linking.openURL('instagram://story-camera');
                }
            }).catch(err => console.error('An error occurred', err));
        }
    }

    facebookShare() {
        var uri = this.state.uri;
        const dirs = RNFetchBlob.fs.dirs

        if (uri.indexOf('assets-library') !== -1) {
            //from camera roll
            RNFetchBlob.fs.cp(uri, `${dirs.DocumentDir}/helloworld.png`)
                .then((success) => {
                    shareOnFacebook({
                        'text': " #poptag",
                        'image': `${dirs.DocumentDir}/helloworld.png`,
                    },
                        (results) => {
                            if (results == "not_available") {
                                Linking.openURL('itms-apps://itunes.apple.com/ca/app/facebook/id284882215?mt=8');
                            }
                            else if (results == "cancelled") {

                            }
                            else if (results == "success") {
                                this.props.successTweet();
                            }
                            else {
                                Linking.openURL('https://play.google.com/store/apps/details?id=com.facebook.katana');
                            }
                        }
                    );
                })
                .catch(() => { })
        }
        else if (uri.indexOf('file') !== -1) {
            //local file:/// extension from real picture
            uri = uri.replace("file://", "")
            shareOnFacebook({
                'text': "#poptag",
                'image': uri,
            },
                (results) => {
                    if (results == "not_available") {
                        Linking.openURL('itms-apps://itunes.apple.com/ca/app/facebook/id284882215?mt=8');
                    }
                    else if (results == "cancelled") {

                    }
                    else if (results == "success") {
                        this.props.successTweet();
                    }
                    else {
                        Linking.openURL('https://play.google.com/store/apps/details?id=com.facebook.katana');
                    }
                }
            );
        }

    }

    tweet() {
        var uri = this.state.uri;
        const dirs = RNFetchBlob.fs.dirs

        if (uri.indexOf('assets-library') !== -1 || uri.indexOf('content') !== -1) {
            RNFetchBlob.fs.cp(uri, `${dirs.DocumentDir}/helloworld.png`)
                .then((success) => {
                    this.SOT(`${dirs.DocumentDir}/helloworld.png`);
                })
                .catch(() => { })
        }
        else if (uri.indexOf('file') !== -1) {
            uri = uri.replace("file://", "");
            this.SOT(uri);
        }
    }

    SOT(uri) {
        shareOnTwitter({
            'text': this.props.challenges[this.state.rand].description + " #poptag #" + this.props.groups.find(item => item.id === global.custom).name.replace(/\s+/g, '') + " 🎈",
            'image': uri,
        },
            (results) => {
                if (results == "not_available") {
                    Linking.openURL('itms-apps://itunes.apple.com/ca/app/twitter/id333903271?mt=8');
                }
                else if (results == "cancelled") {

                }
                else if (results == "success") {
                    this.props.successTweet();
                }
                else {
                    Linking.openURL('https://play.google.com/store/apps/details?id=com.twitter.android');
                }
            }
        );
    }

    downloadVideo() {
        var uri = this.state.uri;
        const dirs = RNFetchBlob.fs.dirs

        if (uri.indexOf('assets-library') !== -1) {
            // if (uri.indexOf('MOV') !== -1) {
            //     RNFetchBlob.fs.cp(uri, `${dirs.DocumentDir}/helloworld.mp4`)
            //         .then((success) => {
            //             CameraRoll.saveToCameraRoll(`${dirs.DocumentDir}/helloworld.mp4`)
            //                 .then((newUri) => {
            //                     if (typeof newUri !== 'undefined') {
            //                         this.props.successCameraRoll();
            //                     }
            //                 })
            //         })
            //         .catch(() => { })
            // }
        }
        else if (uri.indexOf('mov') !== -1) {
            CameraRoll.saveToCameraRoll(uri)
                .then((newUri) => {
                    if (typeof newUri !== 'undefined') {
                        this.props.successCameraRoll();
                    }
                })
        }
        else if (uri.indexOf('mp4') !== -1) {
            uri = uri.replace("file://", "");
            CameraRoll.saveToCameraRoll(uri)
                .then((newUri) => {
                    if (typeof newUri !== 'undefined') {
                        this.props.successCameraRoll();
                    }
                })
        }
    }

    downloadPhoto() {
        var uri = this.state.uri;

        if (uri.indexOf('assets-library') !== -1 || uri.indexOf('content') !== -1) {

        }
        else if (uri.indexOf('file') !== -1) {
            uri = uri.replace("file://", "");

            // SIMULATOR WAS RENDERING THINGS SIDEWAYS
            // if (Platform.OS === 'android') {
            //     ImageResizer.createResizedImage(uri, 1920, 1080, 'JPEG', 100,
            //         90, `${RNFS.DocumentDirectoryPath}`)
            //         .then((success) => {
            //             CameraRoll.saveToCameraRoll(success.path)
            //                 .then((newUri) => {
            //                     if (typeof newUri !== 'undefined') {
            //                         this.props.successCameraRoll();
            //                     }
            //                 })
            //         })
            // } else {
                CameraRoll.saveToCameraRoll(uri)
                    .then((newUri) => {
                        if (typeof newUri !== 'undefined') {
                            this.props.successCameraRoll();
                        }
                    })
            //}
        }
    }


    shareVideoController(type) {
        var question = this.props.challenges[this.state.rand].description;

        if (type == 'twitter') {
            var url = `twitter://post?message=${question + " @poptagtv #PopTagChallenge #poptag 🎈"}`;
            Linking.canOpenURL(url).then(supported => {
                if (!supported) {
                    Linking.openURL(Platform.OS === 'ios' ? 'itms-apps://itunes.apple.com/ca/app/twitter/id333903271?mt=8' : 'https://play.google.com/store/apps/details?id=com.twitter.android');
                } else {
                    return Linking.openURL(url);
                }
            }).catch(err => console.error('An error occurred', err));
        }
        else if (type == 'instagram') {
            Linking.canOpenURL('instagram://story-camera').then(supported => {
                if (!supported) {
                    Linking.openURL(Platform.OS === 'ios' ? 'itms-apps://itunes.apple.com/us/app/instagram/id389801252?mt=8' : 'https://play.google.com/store/apps/details?id=com.instagram.android');
                } else {
                    return Linking.openURL('instagram://story-camera');
                }
            }).catch(err => console.error('An error occurred', err));
        }
        else if (type == 'facebook') {
            Linking.canOpenURL('fb://post').then(supported => {
                if (!supported) {
                    Linking.openURL(Platform.OS === 'ios' ? 'itms-apps://itunes.apple.com/ca/app/facebook/id284882215?mt=8' : 'https://play.google.com/store/apps/details?id=com.facebook.katana');
                } else {
                    return Linking.openURL('fb://post');
                }
            }).catch(err => console.error('An error occurred', err));
        }
    }

    shareOpenController(photo) {
        var question = this.props.challenges[this.state.rand].description;

        if (Platform.OS === 'ios') {
            Share.open({
                title: "PopTag",
                message: question + " #poptag #" + this.props.groups.find(item => item.id === global.custom).name.replace(/\s+/g, '') + " 🎈",
                url: this.state.uri,
                subject: "PopTag 🎈"
            })
        }
        else {
            if (photo) {
                var uri = this.state.uri.replace("file://", "");

                if (uri.indexOf('assets-library') !== -1) {
                    ReadImageData.readImage(uri, (imageBase64) => {
                        Share.open({
                            title: "PopTag",
                            message: question + " #poptag #" + this.props.groups.find(item => item.id === global.custom).name.replace(/\s+/g, '') + " 🎈",
                            url: `data:image/png;base64,${imageBase64}`,
                            subject: "PopTag 🎈"
                        })
                    });
                }
                else {
                    ImageResizer.createResizedImage(uri, 1920, 1080, 'JPEG', 100,
                        0, `${RNFS.DocumentDirectoryPath}`)
                        .then((success) => {
                            RNFS.readFile(success.path, 'base64').then((imageBase64) => {
                                Share.open({
                                    title: "PopTag",
                                    message: question + " #poptag #" + this.props.groups.find(item => item.id === global.custom).name.replace(/\s+/g, '') + " 🎈",
                                    url: `data:image/png;base64,${imageBase64}`,
                                    subject: "PopTag 🎈"
                                })
                            })
                        })
                }
            }
        }
    }

    renderChallenge(animatedStyle) {
        var question = this.props.challenges[this.state.rand].description;

        return (
            <TouchableOpacity activeOpacity={1}
                onPressIn={this.handlePressIn.bind(this)}
                onLongPress={() => this.props.endQuestion()}
                onPressOut={this.handlePressOut.bind(this)}>
                <Animated.View style={animatedStyle}>
                    <View style={styles.container}>
                        <Image source={{ uri: 'trophy' }} style={styles.trophy} />
                        <Text style={[styles.mainText, { fontSize: question.length > 140 ? Dimensions.get('window').width * 0.031 : question.length > 110 ? Dimensions.get('window').width * 0.036 : Dimensions.get('window').width * 0.042 }]}
                            numberOfLines={4}>{question}</Text>
                    </View>

                    <TouchableOpacity style={styles.blue} activeOpacity={1} onPress={() => this.toggleCamera()}>
                        <Text style={styles.send}>Let's do it!</Text>
                    </TouchableOpacity>

                </Animated.View>
            </TouchableOpacity>
        )
    }

    renderCamera() {
        return (
            <Camera toggleCamera={() => this.toggleCamera()} previewTime={(b) => this.previewTime(b)} />
        )
    }

    renderPreview(animatedStyle) {

        var twee = this.state.uri.indexOf('mov') == -1 && this.state.uri.indexOf('MOV') == -1 && this.state.uri.indexOf('mp4') == -1;
        var question = this.props.challenges[this.state.rand].description;
        var rotate = (Platform.OS === 'android') && twee && this.state.uri.indexOf('assets-library') == -1; //simulator only: imageStyle={{ transform: [{ rotate: rotate ? '90deg' : '0deg' }] }}

        return (
            twee ?
                <TouchableOpacity activeOpacity={1}
                    onPressIn={this.handlePressIn.bind(this)}
                    onPressOut={this.handlePressOut.bind(this)}>
                    <Animated.View style={[animatedStyle, {
                        width: Dimensions.get('window').width,
                        height: Dimensions.get('window').height * 0.7, paddingTop: Dimensions.get('window').height * 0.1
                    }]}>

                        <View style={styles.summarycontainertop}>
                            <ImageBackground source={{ uri: this.state.uri }} style={[styles.cell]}>
                                <LinearGradient
                                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
                                    locations={[0, 0.5, 0.7, 1]}
                                    style={styles.linearGradient}>
                                    <View style={styles.aligner}>
                                        <Text style={styles.summaryText} numberOfLines={2}>{question}</Text>
                                    </View>
                                </LinearGradient>
                            </ImageBackground>
                        </View>

                        <View style={styles.blue2}>
                            <TouchableOpacity activeOpacity={1} onPress={() => this.tweet()}>
                                <Image source={{ uri: 'blank' }} style={styles.instablock} />
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={1} onPress={() => this.insta()}>
                                <Image source={{ uri: 'instagramgradient' }} style={styles.instablock} />
                            </TouchableOpacity>

                            <TouchableOpacity activeOpacity={1} onPress={() => this.shareOpenController(twee)}>
                                <View style={[styles.instablock, { backgroundColor: '#3B5998' }]} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.tweet()} style={{ position: 'absolute', left: Dimensions.get('window').width * 0.8 * (1 / 6) - 14, height: 28, width: 28 }} activeOpacity={1}>
                                <Image source={{ uri: 'twitter' }} style={{ height: 28, width: 28, tintColor: 'white' }} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.insta()} style={{ position: 'absolute', left: Dimensions.get('window').width * 0.8 * (3 / 6) - 14, height: 28, width: 28 }} activeOpacity={1}>
                                <Image source={{ uri: 'instagramicon' }} style={{ height: 28, width: 28, tintColor: 'white' }} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.shareOpenController(twee)} style={{ position: 'absolute', left: Dimensions.get('window').width * 0.8 * (5 / 6) - 14, height: 28, width: 28 }} activeOpacity={1}>
                                <Image source={{ uri: 'share' }} style={{ height: 28, width: 28, tintColor: 'white' }} />
                            </TouchableOpacity>
                        </View>

                    </Animated.View>
                </TouchableOpacity>
                :
                <View style={{
                    width: Dimensions.get('window').width,
                    height: Dimensions.get('window').height * 0.7, paddingTop: Dimensions.get('window').height * 0.1
                }}>

                    <View style={styles.summarycontainertop}>
                        <Video source={{ uri: this.state.uri }}
                            style={[styles.backgroundVideo]}
                            useTextureView={true}
                            repeat
                            resizeMode={'cover'}
                            ignoreSilentSwitch={"obey"}
                            controls={false}
                        >
                            <LinearGradient
                                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
                                locations={[0, 0.5, 0.7, 1]}
                                style={styles.linearGradient}>
                                <View style={styles.aligner}>
                                    <Text style={styles.summaryText} numberOfLines={2}>{question}</Text>
                                </View>
                            </LinearGradient>
                        </Video>
                    </View>

                    <View style={styles.blue2}>
                        {/* <TouchableOpacity activeOpacity={1} onPress={() => this.shareVideoController('twitter')}>
                            <Image source={{ uri: 'blank' }} style={styles.instablock} />
                        </TouchableOpacity> */}

                        <TouchableOpacity activeOpacity={1} onPress={() => this.shareVideoController('instagram')}>
                            <Image source={{ uri: 'instagramgradient' }} style={styles.instablock2} />
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={1} onPress={() => Share.open({
                            title: "PopTag",
                            message: question + " #poptag #" + this.props.groups.find(item => item.id === global.custom).name.replace(/\s+/g, '') + " 🎈",
                            url: this.state.uri,
                            subject: "PopTag 🎈"
                        })}>
                            <View style={[styles.instablock2, { backgroundColor: '#3B5998' }]} />
                        </TouchableOpacity>

                        {/* <TouchableOpacity onPress={() => this.shareVideoController('twitter')} style={{ position: 'absolute', left: Dimensions.get('window').width * 0.8 * (1 / 6) - 14, height: 28, width: 28 }} activeOpacity={1}>
                            <Image source={{ uri: 'twitter' }} style={{ height: 28, width: 28, tintColor: 'white' }} />
                        </TouchableOpacity> */}

                        <TouchableOpacity onPress={() => this.shareVideoController('instagram')} style={{ position: 'absolute', left: Dimensions.get('window').width * 0.8 * (1 / 4) - 14, height: 28, width: 28 }} activeOpacity={1}>
                            <Image source={{ uri: 'instagramicon' }} style={{ height: 28, width: 28, tintColor: 'white' }} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => Share.open({
                            title: "PopTag",
                            message: question + " #poptag #" + this.props.groups.find(item => item.id === global.custom).name.replace(/\s+/g, '') + " 🎈",
                            url: this.state.uri,
                            subject: "PopTag 🎈"
                        })} style={{ position: 'absolute', left: Dimensions.get('window').width * 0.8 * (3 / 4) - 14, height: 28, width: 28 }} activeOpacity={1}>
                            <Image source={{ uri: 'share' }} style={{ height: 28, width: 28, tintColor: 'white' }} />
                        </TouchableOpacity>
                    </View>

                </View>

        )
    }

    render() {

        const animatedStyle = {
            transform: [{ scale: this.animatedValue }],
        };

        return (
            this.state.camera ? this.renderCamera() : !this.state.preview ? this.renderChallenge(animatedStyle) : this.renderPreview(animatedStyle)
        );
    }
}


const styles = StyleSheet.create({
    summaryquestion: {
        borderRadius: (ipad) ? 26 : 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.25,
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        padding: 20,
        marginTop: 0,
        // shadowColor: 'black',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.05,
        // shadowRadius: 4,
    },
    summarycontainertop: {
        borderTopLeftRadius: (ipad) ? 26 : 13,
        borderTopRightRadius: (ipad) ? 26 : 13,
        width: Dimensions.get('window').width * 0.8,
        height: Platform.OS === 'android' ? Dimensions.get('window').width * 0.8 : Dimensions.get('window').width * 0.8 * 1.15,
        // backgroundColor: '#4A90E2',
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    summarycontainerbottom: {
        borderRadius: (ipad) ? 26 : 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.25,
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        padding: 20,
        marginRight: Dimensions.get('window').width * 0.05,
    },
    container: {
        borderTopLeftRadius: (ipad) ? 26 : 13,
        borderTopRightRadius: (ipad) ? 26 : 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.88 * 0.47,
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        padding: 20,
        marginBottom: Dimensions.get('window').height * 0.13,
        // shadowColor: 'black',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.05,
        // shadowRadius: 4,
    },
    blue: {
        position: 'absolute',
        top: Dimensions.get('window').width * 0.88 * 0.47 - (Dimensions.get('window').width * 0.88 * 0.15 * 0.13),
        borderBottomLeftRadius: (ipad) ? 26 : 13,
        borderBottomRightRadius: (ipad) ? 26 : 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.88 * 0.15,
        backgroundColor: '#4A90E2',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        // shadowColor: 'black',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.05,
        // shadowRadius: 4,
    },
    blue2: {
        position: 'absolute',
        top: Platform.OS === 'android' ? Dimensions.get('window').width * 0.8 * 0.98 + Dimensions.get('window').height * 0.1 : Dimensions.get('window').width * 0.8 * 1.13 + Dimensions.get('window').height * 0.1,
        borderBottomLeftRadius: (ipad) ? 26 : 13,
        borderBottomRightRadius: (ipad) ? 26 : 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.88 * 0.15,
        backgroundColor: '#4A90E2',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        padding: 20,
        flexDirection: 'row',
        overflow: 'hidden'
        // shadowColor: 'black',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.05,
        // shadowRadius: 4,
    },
    inputcontainer: {
        borderRadius: (ipad) ? 14 : 7,
        backgroundColor: '#D8D8D8',
        width: Dimensions.get('window').width * 0.75 * 0.88888,
        height: Dimensions.get('window').width * 0.88 * 0.88888 * 0.19758,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 1
    },
    mainText: {
        color: 'black',
        fontWeight: '600',
        fontSize: Dimensions.get('window').width * 0.04,
        textAlign: 'center',
        marginVertical: 16
    },
    subtext: {
        color: '#4A4A4A',
        fontSize: Dimensions.get('window').width * 0.043,
        textAlign: 'center',
    },
    send: {
        color: 'white',
        fontWeight: '800',
        fontSize: Dimensions.get('window').width * 0.04,
        textAlign: 'center',
    },
    summaryText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontWeight: '600',
        fontSize: Dimensions.get('window').width * 0.042,
        marginVertical: Platform.OS === 'android' ? 20 : 10,
    },
    summarySectionTitle: {
        color: 'black',
        fontWeight: '600',
        fontSize: Dimensions.get('window').width * 0.049,
        marginLeft: Dimensions.get('window').width * 0.1,
        marginBottom: 15
    },
    summaryDivider: {
        height: 0.5,
        backgroundColor: 'rgba(0,0,0,0.15)',
        width: Dimensions.get('window').width - Dimensions.get('window').width * 0.2 - 6,
        alignSelf: 'center',
        marginVertical: 25
    },
    spacer: {
        width: Dimensions.get('window').width * 0.1,
    },
    trophy: {
        height: 31,
        width: 31,
        tintColor: '#FFD700'
    },
    cell: {
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.8 * 1.15,
        resizeMode: 'cover',
        justifyContent: 'flex-end'
    },
    linearGradient: {
        height: Platform.OS === 'android' ? Dimensions.get('window').width * 0.8 : Dimensions.get('window').width * 0.8 * 1.15,
        paddingHorizontal: Dimensions.get('window').width * 0.43733 * 0.08,
        paddingBottom: Dimensions.get('window').width * 0.43733 * 0.08,
        justifyContent: 'flex-end',
    },
    aligner: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        alignContent: 'center'
    },
    backgroundVideo: {
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.8 * 1.15,
        justifyContent: 'flex-start',
        //transform: [{ rotate: Platform.OS === 'android' ? '90deg' : '0deg' }] - SIMULATOR ONLY
    },
    instablock: {
        width: Dimensions.get('window').width * 0.8 / 3,
        height: Dimensions.get('window').width * 0.88 * 0.15,
    },
    instablock2: {
        width: Dimensions.get('window').width * 0.8 / 2,
        height: Dimensions.get('window').width * 0.88 * 0.15,
    }
});