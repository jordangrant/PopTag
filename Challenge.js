import React, { Component } from 'react';
import {
    StyleSheet, View, Image, Dimensions, TouchableOpacity,
    Animated, AsyncStorage, Text, TextInput, Keyboard, Platform, FlatList,
    Linking, CameraRoll, ImageBackground, NativeModules
} from 'react-native';
import { COMPANIES } from './xcompanies';
import { DEFAULT } from './xquestions';
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
        this.state.rand = Math.floor(Math.random() * COMPANIES.find(item => item.id === global.custom).questions.length);
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
    }

    async insta() {
        var uri = this.state.uri;

        if (uri.indexOf('assets-library') !== -1) {
            ReadImageData.readImage(uri, (imageBase64) => {
                RNInstagramStoryShare.share({
                    backgroundImage: `data:image/png;base64,${imageBase64}`,
                    deeplinkingUrl: 'instagram-stories://share'
                })
                    .then(() => console.log('SUCCESS'))
                    .catch(e => console.log('ERRORZZZZZZZZ', e))
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
                            .catch(e => console.log('ERRORZZZZZZZZ', e))
                    })
                })
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
                        //'link':'https://artboost.com/',
                        //'imagelink':'https://artboost.com/apple-touch-icon-144x144.png',
                        //or use image
                        'image': `${dirs.DocumentDir}/helloworld.png`,
                    },
                        (results) => {
                            if (results == "not_available") {
                                Linking.openURL('itms-apps://itunes.apple.com/ca/app/facebook/id284882215?mt=8')
                            }
                            else if (results == "cancelled") {

                            }
                            else if (results == "success") {
                                this.props.successTweet();
                            }
                        }
                    );
                })
                .catch(() => { })
        }
        else {
            //local file:/// extension
            shareOnFacebook({
                'text': " #poptag #poptagapp",
                //'link':'https://artboost.com/',
                //'imagelink':'https://artboost.com/apple-touch-icon-144x144.png',
                //or use image
                'image': uri.replace("file://", ""),
            },
                (results) => {
                    if (results == "not_available") {
                        Linking.openURL('itms-apps://itunes.apple.com/ca/app/facebook/id284882215?mt=8')
                    }
                    else if (results == "cancelled") {

                    }
                    else if (results == "success") {
                        this.props.successTweet();
                    }
                }
            );
        }

    }

    tweet() {
        var uri = this.state.uri;
        const dirs = RNFetchBlob.fs.dirs

        if (uri.indexOf('assets-library') !== -1) {
            RNFetchBlob.fs.cp(uri, `${dirs.DocumentDir}/helloworld.png`)
                .then((success) => {
                    this.SOT(`${dirs.DocumentDir}/helloworld.png`);
                })
                .catch(() => { })
        }
        else {
            this.SOT(uri.replace("file://", ""));
        }
    }

    SOT(uri) {
        shareOnTwitter({
            'text': COMPANIES.find(item => item.id === global.custom).questions.find(item => item.id === this.state.rand).question + " @poptagtv #PopTagChallenge #poptag 🎈",
            //'link': 'https://artboost.com/',
            //'imagelink': global.media,
            //or use image
            'image': uri,
        },
            (results) => {
                if (results == "not_available") {
                    Linking.openURL('itms-apps://itunes.apple.com/ca/app/twitter/id333903271?mt=8')
                }
                else if (results == "cancelled") {

                }
                else if (results == "success") {
                    this.props.successTweet();
                }
            }
        );
    }

    downloadVideo() {
        var uri = this.state.uri;
        const dirs = RNFetchBlob.fs.dirs

        if (uri.indexOf('assets-library') !== -1) {
            if (uri.indexOf('MOV') !== -1) {
                RNFetchBlob.fs.cp(uri, `${dirs.DocumentDir}/helloworld.mp4`)
                    .then((success) => {
                        CameraRoll.saveToCameraRoll(`${dirs.DocumentDir}/helloworld.mp4`)
                            .then((newUri) => {
                                if (typeof newUri !== 'undefined') {
                                    this.props.successCameraRoll();
                                }
                            })
                    })
                    .catch(() => { })
            }
        }
        else if (uri.indexOf('mov') !== -1) {
            CameraRoll.saveToCameraRoll(uri)
                .then((newUri) => {
                    if (typeof newUri !== 'undefined') {
                        this.props.successCameraRoll();
                    }
                })
        }
    }

    renderChallenge(animatedStyle) {
        var question = COMPANIES.find(item => item.id === global.custom).questions.find(item => item.id === this.state.rand).question;

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

        var twee = this.state.uri.indexOf('mov') == -1 && this.state.uri.indexOf('MOV') == -1

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
                            <ImageBackground source={{ uri: this.state.uri }} style={styles.cell}>
                                <LinearGradient
                                    colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.6)']}
                                    locations={[0, 0.5, 0.7, 1]}
                                    style={styles.linearGradient}>
                                    <View style={styles.aligner}>
                                        <Text style={styles.summaryText} numberOfLines={2}>{COMPANIES.find(item => item.id === global.custom).questions.find(item => item.id === this.state.rand).question}</Text>
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

                            <TouchableOpacity activeOpacity={1} onPress={() => this.facebookShare()}>
                                <View style={[styles.instablock, { backgroundColor: '#3B5998' }]} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.tweet()} style={{ position: 'absolute', left: Dimensions.get('window').width * 0.8 * (1 / 6) - 14, height: 28, width: 28 }} activeOpacity={1}>
                                <Image source={{ uri: 'twitter' }} style={{ height: 28, width: 28, tintColor: 'white' }} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.insta()} style={{ position: 'absolute', left: Dimensions.get('window').width * 0.8 * (3 / 6) - 14, height: 28, width: 28 }} activeOpacity={1}>
                                <Image source={{ uri: 'instagramicon' }} style={{ height: 28, width: 28, tintColor: 'white' }} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => this.facebookShare()} style={{ position: 'absolute', left: Dimensions.get('window').width * 0.8 * (5 / 6) - 14, height: 28, width: 28 }} activeOpacity={1}>
                                <Image source={{ uri: 'fb' }} style={{ height: 28, width: 28, tintColor: 'white' }} />
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
                        <Video source={{ uri: this.state.uri }} style={styles.backgroundVideo}
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
                                    <Text style={styles.summaryText} numberOfLines={2}>{COMPANIES.find(item => item.id === global.custom).questions.find(item => item.id === this.state.rand).question}</Text>
                                </View>
                            </LinearGradient>
                        </Video>
                    </View>

                    <TouchableOpacity style={styles.blue2} activeOpacity={1} onPress={() => this.downloadVideo()}>
                        <Image source={{ uri: 'download' }} style={{ height: 28, width: 28, tintColor: 'white' }} />
                    </TouchableOpacity>

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
        borderRadius: 13,
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
        borderTopLeftRadius: 13,
        borderTopRightRadius: 13,
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
        borderRadius: 13,
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
        borderTopLeftRadius: 13,
        borderTopRightRadius: 13,
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
        borderBottomLeftRadius: 13,
        borderBottomRightRadius: 13,
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
        borderBottomLeftRadius: 13,
        borderBottomRightRadius: 13,
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
        borderRadius: 7,
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
    },
    instablock: {
        width: Dimensions.get('window').width * 0.8 / 3,
        height: Dimensions.get('window').width * 0.88 * 0.15,
    }
});