import React, { Component } from 'react';
import {
    StyleSheet, View, Image, Dimensions, TouchableOpacity, ScrollView,
    Animated, AsyncStorage, Text, Platform, FlatList, Vibration,
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
import Bubble from './Bubble';
import RNThumbnail from 'react-native-thumbnail';

const ipad = (Dimensions.get('window').height > 1020);
const iphonex = (Platform.OS === 'ios' && Dimensions.get('window').height > 800 && Dimensions.get('window').height < 1020);

class MyListItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            uri: 'null'
        };

    }

    componentWillMount() {
        this.animatedValue = new Animated.Value(1);
    }

    componentDidUpdate() {
        if (this.state.uri == 'null') {
            const uri = this.props.bubble.media;

            if (uri.indexOf('mov') !== -1 || uri.indexOf('MOV') !== -1) {
                RNThumbnail.get(uri).then((result) => {
                    this.setState({ uri: result.path });
                    this.props.updateBubble(this.props.index, result.path);
                })
            }
        }
    }

    handlePressIn() {
        if (Platform.OS === 'ios') {
            Animated.spring(this.animatedValue, {
                toValue: 1.05
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
        }).start()
    }

    render() {
        const animatedStyle = {
            transform: [{ scale: this.animatedValue }]
        }

        const uri = this.props.bubble.media;
        const video = (uri.indexOf('mov') !== -1 || uri.indexOf('MOV') !== -1);
        // var rotate = (Platform.OS === 'android' && uri.indexOf('mp4') == -1 && uri.indexOf('MP4') == -1 && uri.indexOf('assets-library') == -1);
        // imageStyle={{ transform: [{ rotate: rotate ? '90deg' : '0deg' }, { scale: rotate ? 1.5 : 1 }] }}

        return (
            <TouchableOpacity activeOpacity={1}
                onPressIn={this.handlePressIn.bind(this)}
                onPress={() => this.props.press(this.props.index)}
                onPressOut={this.handlePressOut.bind(this)}
                onLongPress={() => this.props.longPress(this.props.index)}
            >
                <Animated.View style={[animatedStyle, this.props.bubble.state == 'default' ? styles.summarycontainerbottom : styles.scbblue]}>
                    <ImageBackground source={{ uri: !this.props.bubble.state == 'completed' ? 'null' : video ? this.state.uri : this.props.bubble.media }}
                        style={styles.cell}>

                        {this.props.bubble.state == 'completed' ?
                            <LinearGradient
                                colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0)']}
                                locations={[0, 0.5, 0.85, 1]}
                                style={styles.linearGradient}>
                            </LinearGradient>
                            : null}

                        <View style={styles.aligner}>
                            <Text style={[this.props.bubble.state == 'default' ? styles.cellText : styles.cellTextAlt,
                        {fontSize: this.props.data.description.length > 90 ? Dimensions.get('window').width * 0.035 : Dimensions.get('window').width * 0.04}]}>
                                {this.props.data.description}
                            </Text>
                        </View>

                        {this.props.bubble.state !== 'default' ?
                            <Image source={{ uri: 'check' }} style={styles.check} />
                            : null}

                    </ImageBackground>
                </Animated.View>
            </TouchableOpacity>
        );
    }
}

export default class Scavenger extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bubbles: [
                { id: 0, state: 'default', media: 'null' },
                { id: 1, state: 'default', media: 'null' },
                { id: 2, state: 'default', media: 'null' },
                { id: 3, state: 'default', media: 'null' },
                { id: 4, state: 'default', media: 'null' },
                { id: 5, state: 'default', media: 'null' },
                { id: 6, state: 'default', media: 'null' },
                { id: 7, state: 'default', media: 'null' },
                { id: 8, state: 'default', media: 'null' },
            ],
            text: '',
            rand: 0,
            preview: false,
            spinner: false,
            camera: false,
            dialogue: true,
            uri: '',
            cameraId: 0
        };
    }


    componentWillMount() {
        this.animatedValue = new Animated.Value(1);
        this.state.rand = Math.floor(Math.random() * this.props.challenges.length);
    }

    handlePressIn() {
        if (Platform.OS === 'ios') {
            Animated.spring(this.animatedValue, {
                toValue: 1.2
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

    toggleCamera() {
        this.props.camera();
        this.setState({ camera: !this.state.camera });
    }

    toggleCamera(id) {
        this.props.camera();
        this.setState({ cameraId: id, camera: !this.state.camera });
    }

    togglePreview() {
        this.setState({ preview: !this.state.preview });
    }

    previewTime(uri, cameraId) {
        const dirs = RNFetchBlob.fs.dirs
        this.setState({ uri: uri });
        this.toggleCamera(cameraId);

        if (uri.indexOf('assets-library') !== -1) {
            RNFetchBlob.fs.cp(uri, `${dirs.DocumentDir}/helloworld.png`)
            .then((success) => {
                uri = `${dirs.DocumentDir}/helloworld.png`;
            })
        }

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

        const tempBubbles = this.state.bubbles;
        const bubble = tempBubbles.filter(b => b.id === cameraId)[0];
        const index = tempBubbles.indexOf(bubble);

        bubble.media = uri;
        bubble.state = 'completed';

        tempBubbles[index] = bubble;
        this.setState({ bubbles: tempBubbles });
    }

    press(id) {
        this.toggleCamera(id);
    }

    longPress(id) {
        const tempBubbles = this.state.bubbles;
        const bubble = tempBubbles.filter(b => b.id === id)[0];
        const index = tempBubbles.indexOf(bubble);

        if (bubble.state == 'default') {
            bubble.state = 'active';
        }
        else if (bubble.state == 'active') {
            bubble.state = 'default';
        }
        else if (bubble.state == 'completed') {
            alert("Already completed, long press to update media :)");
        }

        tempBubbles[index] = bubble;
        this.setState({ bubbles: tempBubbles });
    }

    updateBubble(id, media) {
        const tempBubbles = this.state.bubbles;
        const bubble = tempBubbles.filter(b => b.id === id)[0];
        const index = tempBubbles.indexOf(bubble);

        bubble.media = media;

        tempBubbles[index] = bubble;
        this.setState({ bubbles: tempBubbles });
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
                    90, `${RNFS.DocumentDirectoryPath}`)
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
            'text': this.props.challenges[this.state.rand].description + " @poptagtv #PopTagChallenge #poptag 🎈",
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
            CameraRoll.saveToCameraRoll(uri)
                .then((newUri) => {
                    if (typeof newUri !== 'undefined') {
                        this.props.successCameraRoll();
                    }
                })
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
                message: question + " @poptagtv #poptag 🎈",
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
                            message: question + " @poptagtv #poptag 🎈",
                            url: `data:image/png;base64,${imageBase64}`,
                            subject: "PopTag 🎈"
                        })
                    });
                }
                else {
                    ImageResizer.createResizedImage(uri, 1920, 1080, 'JPEG', 100,
                        90, `${RNFS.DocumentDirectoryPath}`)
                        .then((success) => {
                            RNFS.readFile(success.path, 'base64').then((imageBase64) => {
                                Share.open({
                                    title: "PopTag",
                                    message: question + " @poptagtv #poptag 🎈",
                                    url: `data:image/png;base64,${imageBase64}`,
                                    subject: "PopTag 🎈"
                                })
                            })
                        })
                }
            }
        }
    }

    start() {
        this.props.toggleDeepScavenger();
    }

    _renderFooter = ({ item }) => (
        <View style={{ height: 20 }} />
    );

    _renderItem = ({ item, index }) => (
        <MyListItem
            data={item}
            index={index}
            bubble={this.state.bubbles[index]}
            press={this.press.bind(this)}
            longPress={this.longPress.bind(this)}
            updateBubble={(id, media) => this.updateBubble(id, media)}
        />
    );

    renderDialogue(animatedStyle) {
        var name = this.props.groups.find(item => item.id === global.custom).name;

        return (
            <TouchableOpacity activeOpacity={1}
                onPressIn={this.handlePressIn.bind(this)}
                onLongPress={() => this.props.endQuestion()}
                onPressOut={this.handlePressOut.bind(this)}>
                <Animated.View style={animatedStyle}>
                    <View style={styles.container}>
                        <Text style={[styles.mainText]}>
                            Welcome to the {name} scavenger hunt! Tap an item to take a picture or video. Long press to simply mark as completed.</Text>
                    </View>

                    <TouchableOpacity style={styles.blue} activeOpacity={1} onPress={() => this.start()}>
                        <Text style={styles.send}>Let's do it!</Text>
                    </TouchableOpacity>

                </Animated.View>
            </TouchableOpacity>
        )
    }


    renderChallenge(animatedStyle) {
        return (
            <View style={styles.boundingBubbleBox}>

                <FlatList
                    data={this.props.challenges.slice(0, 9)}
                    renderItem={this._renderItem}
                    scrollEnabled
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={this._renderFooter}
                    showsHorizontalScrollIndicator={false}
                    numColumns={2}
                    extraData={this.state}
                />

            </View>
        )
    }

    renderCamera() {
        return (
            <Camera cameraId={this.state.cameraId} toggleCamera={() => this.toggleCamera()}
                previewTime={(b, a) => this.previewTime(b, a)} />
        )
    }

    renderPreview(animatedStyle) {

        return (
            <View>
                <TouchableOpacity activeOpacity={1} onPress={() => this.goToLayout()}>
                    <Image source={{ uri: 'layout' }} style={styles.layouticon} />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={1} style={styles.nextButton} onPress={() => this.goToLayout()}>
                    <Text style={styles.nextText}>Create Layout</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={1} style={[styles.nextButton, { backgroundColor: '#4A4A4A' }]} onPress={() => this.togglePreview()}>
                    <Text style={styles.nextText}>Go Back</Text>
                </TouchableOpacity>

            </View>

        )
    }

    render() {

        const animatedStyle = {
            transform: [{ scale: this.animatedValue }],
        };

        return (
            this.state.camera ? this.renderCamera() : !this.props.deepScavenger ? this.renderDialogue() :
                this.state.preview ? this.renderPreview(animatedStyle) : this.renderChallenge(animatedStyle)
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
    container: {
        borderTopLeftRadius: (ipad) ? 26 : 13,
        borderTopRightRadius: (ipad) ? 26 : 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.88 * 0.4,
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        marginBottom: Dimensions.get('window').height * 0.13,
        // shadowColor: 'black',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.05,
        // shadowRadius: 4,
    },
    blue: {
        position: 'absolute',
        top: Dimensions.get('window').width * 0.88 * 0.4 - (Dimensions.get('window').width * 0.88 * 0.15 * 0.13),
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
    backgroundVideo: {
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.8 * 1.15,
        justifyContent: 'flex-start',
    },
    instablock: {
        width: Dimensions.get('window').width * 0.8 / 3,
        height: Dimensions.get('window').width * 0.88 * 0.15,
    },
    nextButton: {
        borderRadius: (ipad) ? 26 : 13,
        width: Dimensions.get('window').width * 0.872,
        height: Dimensions.get('window').width * 0.872 * 0.15,
        marginTop: 20,
        backgroundColor: '#4A90E2',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center'
    },
    nextText: {
        color: 'white',
        fontWeight: '600',
        fontSize: Dimensions.get('window').width * 0.049,
    },
    boundingBubbleBox: {
        width: Dimensions.get('window').width,
        alignItems: 'center',
        marginTop: Dimensions.get('window').height * 0.17,
        marginBottom: (iphonex) ? Dimensions.get('window').height * 0.11 : Dimensions.get('window').height * 0.145,
    },
    layouticon: {
        alignSelf: 'center',
        height: Dimensions.get('window').height * 0.2,
        width: Dimensions.get('window').height * 0.2,
    },
    linearGradient: {
        position: 'absolute',
        height: Dimensions.get('window').width * 0.43733 * 0.829268,
        justifyContent: 'flex-end',
        width: Dimensions.get('window').width * 0.43733,
        paddingHorizontal: Dimensions.get('window').width * 0.43733 * 0.08,
        paddingBottom: Dimensions.get('window').width * 0.43733 * 0.08,
    },
    summarycontainerbottom: {
        borderRadius: (ipad) ? 26 : 13,
        //borderWidth: 0.25,
        //borderColor: 'black',
        width: Dimensions.get('window').width * 0.43733,
        height: Dimensions.get('window').width * 0.43733 * 0.86585,
        marginVertical: 6,
        marginHorizontal: 6,
        backgroundColor: 'rgba(255,255,255,0.54)',
        overflow: 'hidden'
    },
    scbblue: {
        borderRadius: (ipad) ? 26 : 13,
        //borderWidth: 0.25,
        //borderColor: 'black',
        width: Dimensions.get('window').width * 0.43733,
        height: Dimensions.get('window').width * 0.43733 * 0.86585,
        marginVertical: 6,
        marginHorizontal: 6,
        backgroundColor: '#4A90E2',
        overflow: 'hidden'
    },
    cellText: {
        flex: 1,
        flexWrap: 'wrap',
        color: 'black',
        fontWeight: '600',
        backgroundColor: 'transparent'
    },
    cellTextAlt: {
        flex: 1,
        flexWrap: 'wrap',
        color: 'white',
        fontWeight: '600',
        backgroundColor: 'transparent'
    },
    cell: {
        width: Dimensions.get('window').width * 0.43733,
        height: Dimensions.get('window').width * 0.43733 * 0.86585,
        resizeMode: 'cover',
    },
    aligner: {
        paddingLeft: Dimensions.get('window').width * 0.43733 * 0.0915,
        paddingVertical: Dimensions.get('window').width * 0.43733 * 0.0915,
        paddingRight: Dimensions.get('window').width * 0.43733 * 0.15,
        width: Dimensions.get('window').width * 0.43733,
        height: Dimensions.get('window').width * 0.43733 * 0.86585,
    },
    check: {
        height: Dimensions.get('window').width * 0.43733 * 0.2,
        width: Dimensions.get('window').width * 0.43733 * 0.2,
        tintColor: '#FFD700',
        position: 'absolute',
        right: 8,
        bottom: 8,
    }
});