import React, { Component } from 'react';
import {
    StyleSheet, View, Image, Dimensions, TouchableOpacity, ImageEditor,
    Animated, AsyncStorage, Text, TextInput, Keyboard, Platform, FlatList,
    Linking, CameraRoll, ImageBackground, NativeModules, PermissionsAndroid
} from 'react-native';
import { shareOnFacebook, shareOnTwitter } from 'react-native-social-share';
import RNInstagramStoryShare from 'react-native-instagram-story-share';
import Spinner from 'react-native-loading-spinner-overlay';
import Video from 'react-native-video';
import LinearGradient from 'react-native-linear-gradient';
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import Share from 'react-native-share';

var ReadImageData = NativeModules.ReadImageData;
const ipad = (Dimensions.get('window').height > 1020);
const iphonex = (Platform.OS === 'ios' && Dimensions.get('window').height > 800 && Dimensions.get('window').height < 1020);

export default class AB extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            rand: 0,
            rand2: 1,
            crown1: false,
            crown2: false,
            preview: false,
            spinner: false,
            uri: ''
        };
    }

    componentWillMount() {
        this.animatedValue = new Animated.Value(1);
        this.state.rand = Math.floor(Math.random() * this.props.challenges.length);
        this.state.rand2 = Math.floor(Math.random() * this.props.challenges.length);
        if (this.state.rand == this.state.rand2) {
            this.state.rand2 = Math.floor(Math.random() * this.props.challenges.length);
        }

    }

    handlePressIn() {
        if (Platform.OS === 'ios') {
            Animated.spring(this.animatedValue, {
                toValue: 1.01
            }).start()
        }
        else {
            Animated.spring(this.animatedValue, {
                toValue: 1.01
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
            var uri = global.screenshot;

            let resizedUri = await new Promise((resolve, reject) => {
                ImageEditor.cropImage(uri,
                    {
                        offset: { x: 0, y: 0 },
                        size: { width: 1080, height: 1920 },
                        //displaySize: { width: 1920, height: 1080 },
                        resizeMode: 'contain',
                    },
                    (uri) => resolve(uri),
                    () => reject(),
                );
            });

            ImageResizer.createResizedImage(resizedUri, 1920, 1080, 'JPEG', 100,
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

    tweet(crown1) {
        if (Platform.OS == 'android') {
            global.screenshot = global.screenshot.replace("file://", "")
        }
        shareOnTwitter({
            'text': this.props.challenges[crown1 ? this.state.rand : this.state.rand2].description + "👑 #poptag #" + this.props.groups.find(item => item.id === global.custom).name.replace(/\s+/g, '') + " 🎈",
            //'link': 'https://artboost.com/',
            //'imagelink': global.screenshot,
            //or use image
            'image': global.screenshot, //doesnt render on android
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
                else {
                    Linking.openURL('https://play.google.com/store/apps/details?id=com.twitter.android')
                }
            }
        );
    }

    facebookShare() {
        if (Platform.OS == 'android') {
            global.screenshot = global.screenshot.replace("file://", "")
        }
        shareOnFacebook({
            'text': "#poptag",
            //'link':'https://artboost.com/',
            //'imagelink':'https://artboost.com/apple-touch-icon-144x144.png',
            //or use image
            'image': global.screenshot,
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
                else {
                    //android with no app installed
                    Linking.openURL('https://play.google.com/store/apps/details?id=com.facebook.katana')
                }
            }
        );
    }

    abSelection(selection) {

            if (selection == 1) {
                this.setState({ crown1: true, crown2: false });
                this.recycle(selection);
            }
            else {
                this.setState({ crown2: true, crown1: false });
                this.recycle(selection);
            }
            //setTimeout(() => this.props.submitWithoutSave(), 100);
    }

    recycle(selection) {
        var num = Math.floor(Math.random() * this.props.challenges.length);

        if (selection == 1) {
            this.setState({ preview: false, rand2: num });

            if (this.state.rand == num) {
                this.setState({ rand2: Math.floor(Math.random() * this.props.challenges.length) });
            }

            setTimeout(() => this.setState({ crown1: false }), 450);
        }
        else {
            this.setState({ preview: false, rand: num });

            if (this.state.rand2 == num) {
                this.setState({ rand: Math.floor(Math.random() * this.props.challenges.length) });
            }

            setTimeout(() => this.setState({ crown2: false }), 450);
        }
    }

    renderAB(animatedStyle) {

        return (
            <View>
                {typeof this.props.challenges[this.state.rand].image == 'undefined' || this.props.challenges[this.state.rand2].image == 'undefined' ?
                    <View />
                    :
                    <View style={styles.adjacent}>
                        <TouchableOpacity activeOpacity={1}
                            onPressIn={this.handlePressIn.bind(this)}
                            onPress={() => this.abSelection(1)}
                            onPressOut={this.handlePressOut.bind(this)}>
                            <Animated.View style={animatedStyle}>
                                <ImageBackground style={styles.container} source={{ uri: this.props.challenges[this.state.rand].image.url }}>
                                    {this.state.crown1 ?
                                        <Image source={{ uri: 'crown' }} style={styles.crown} />
                                        : null}
                                    <LinearGradient
                                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
                                        locations={[0, 0.5, 0.7, 1]}
                                        style={styles.linearGradient}>
                                        <View style={styles.aligner}>
                                            <Text style={styles.mainText} numberOfLines={1}>{this.props.challenges[this.state.rand].description}</Text>
                                        </View>
                                    </LinearGradient>
                                </ImageBackground>
                            </Animated.View>
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={1}
                            onPressIn={this.handlePressIn.bind(this)}
                            onPress={() => this.abSelection(2)}
                            onPressOut={this.handlePressOut.bind(this)}>
                            <Animated.View style={animatedStyle}>
                                <ImageBackground style={styles.container} source={{ uri: image2 = this.props.challenges[this.state.rand2].image.url }}>
                                    {this.state.crown2 ?
                                        <Image source={{ uri: 'crown' }} style={styles.crown} />
                                        : null}
                                    <LinearGradient
                                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
                                        locations={[0, 0.5, 0.7, 1]}
                                        style={styles.linearGradient}>
                                        <View style={styles.aligner}>
                                            <Text style={styles.mainText} numberOfLines={1}>{this.props.challenges[this.state.rand2].description}</Text>
                                        </View>
                                    </LinearGradient>
                                </ImageBackground>
                            </Animated.View>
                        </TouchableOpacity>
                    </View>
                }
            </View>
        )
    }

    renderSummary(animatedStyle) {

        return (
            <View >
                {typeof this.props.challenges[this.state.rand].image == 'undefined' || this.props.challenges[this.state.rand2].image == 'undefined' ?
                    <View />
                    :
                    <View style={styles.adjacent}>
                        {this.state.crown1 ?
                            <TouchableOpacity activeOpacity={1}
                                onPressIn={this.handlePressIn.bind(this)}
                                onPress={() => this.recycle(1)}
                                onPressOut={this.handlePressOut.bind(this)}>
                                <Animated.View style={animatedStyle}>
                                    <ImageBackground style={styles.containerWide} source={{ uri: this.props.challenges[this.state.rand].image.url }}>
                                        <Image source={{ uri: 'crown' }} style={styles.crown} />
                                        <LinearGradient
                                            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
                                            locations={[0, 0.5, 0.7, 1]}
                                            style={styles.linearGradient2}>
                                            <View style={styles.aligner}>
                                                <Text style={styles.mainText} numberOfLines={1}>{this.props.challenges[this.state.rand].description}</Text>
                                            </View>
                                        </LinearGradient>
                                    </ImageBackground>
                                </Animated.View>
                            </TouchableOpacity>
                            : null}

                        {this.state.crown2 ?
                            <TouchableOpacity activeOpacity={1}
                                onPressIn={this.handlePressIn.bind(this)}
                                onPress={() => this.recycle(2)}
                                onPressOut={this.handlePressOut.bind(this)}>
                                <Animated.View style={animatedStyle}>
                                    <ImageBackground style={styles.containerWide} source={{ uri: image2 = this.props.challenges[this.state.rand2].image.url }}>
                                        <Image source={{ uri: 'crown' }} style={styles.crown} />
                                        <LinearGradient
                                            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.7)']}
                                            locations={[0, 0.5, 0.7, 1]}
                                            style={styles.linearGradient2}>
                                            <View style={styles.aligner}>
                                                <Text style={styles.mainText} numberOfLines={1}>{this.props.challenges[this.state.rand2].description}</Text>
                                            </View>
                                        </LinearGradient>
                                    </ImageBackground>
                                </Animated.View>
                            </TouchableOpacity>
                            : null}
                    </View>
                }

                <View style={styles.blue2}>
                    <TouchableOpacity activeOpacity={1} onPress={() => this.tweet(this.state.crown1)}>
                        <Image source={{ uri: 'blank' }} style={ipad ? styles.instablockIpad : styles.instablock} />
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={1} onPress={() => this.insta()}>
                        <Image source={{ uri: 'instagramgradient' }} style={ipad ? styles.instablockIpad : styles.instablock} />
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={1} onPress={() => Share.open({
                        title: "PopTag",
                        message: this.props.challenges[this.state.crown1 ? this.state.rand : this.state.rand2].description + "👑 #poptag 🎈",
                        url: global.screenshot,
                        subject: "PopTag 🎈"
                    })}>
                        <View style={[ipad ? styles.instablockIpad : styles.instablock, { backgroundColor: '#3B5998' }]} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.tweet(this.state.crown1)} style={styles.left} activeOpacity={1}>
                        <Image source={{ uri: 'twitter' }} style={styles.icon} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => this.insta()} style={styles.middle} activeOpacity={1}>
                        <Image source={{ uri: 'instagramicon' }} style={styles.icon} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => Share.open({
                        title: "PopTag",
                        message: this.props.challenges[this.state.crown1 ? this.state.rand : this.state.rand2].description + "👑 #poptag 🎈",
                        url: global.screenshot,
                        subject: "PopTag 🎈"
                    })} style={styles.right} activeOpacity={1}>
                        <Image source={{ uri: 'share' }} style={styles.icon} />
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
            !this.state.preview ? this.renderAB(animatedStyle) : this.renderSummary(animatedStyle)
        );
    }
}


const styles = StyleSheet.create({
    icon: {
        height: (ipad) ? 34 : 28,
        width: (ipad) ? 34 : 28,
        tintColor: 'white'
    },
    left: {
        position: 'absolute',
        left: (ipad) ? Dimensions.get('window').width * 0.5 * (1 / 6) - 14 : Dimensions.get('window').width * 0.8 * (1 / 6) - 14,
        height: (ipad) ? 34 : 28,
        width: (ipad) ? 34 : 28,
    },
    middle: {
        position: 'absolute',
        left: (ipad) ? Dimensions.get('window').width * 0.5 * (3 / 6) - 14 : Dimensions.get('window').width * 0.8 * (3 / 6) - 14,
        height: (ipad) ? 34 : 28,
        width: (ipad) ? 34 : 28,
    },
    right: {
        position: 'absolute',
        left: (ipad) ? Dimensions.get('window').width * 0.5 * (5 / 6) - 14 : Dimensions.get('window').width * 0.8 * (5 / 6) - 14,
        height: (ipad) ? 34 : 28,
        width: (ipad) ? 34 : 28,
    },
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
        height: Dimensions.get('window').width * 0.8 * 1.15,
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
        borderRadius: 13,
        width: Dimensions.get('window').width * 0.442,
        height: (iphonex) ? Dimensions.get('window').height * 0.5 : Dimensions.get('window').height * 0.5742,
        backgroundColor: 'white',
        margin: 4,
        overflow: 'hidden'
    },
    containerWide: {
        borderRadius: 13,
        marginTop: 0,
        width: (ipad) ? Dimensions.get('window').width * 0.5 : Dimensions.get('window').width * 0.8,
        height: (ipad) ? Dimensions.get('window').height * 0.51 : Dimensions.get('window').height * 0.5742,
        backgroundColor: 'white',
        margin: 4,
        overflow: 'hidden',
        resizeMode: 'stretch'
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
        top: (ipad) ? Dimensions.get('window').height*0.49 - 40 : Dimensions.get('window').height * 0.55,
        borderBottomLeftRadius: 13,
        borderBottomRightRadius: 13,
        width: (ipad) ? Dimensions.get('window').width * 0.5 : Dimensions.get('window').width * 0.8,
        height: (ipad) ? Dimensions.get('window').width * 0.88 * 0.1 : Dimensions.get('window').width * 0.88 * 0.15,
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
        color: 'white',
        fontWeight: '600',
        fontSize: Dimensions.get('window').width * 0.034,
        textAlign: 'center',
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
        height: (iphonex) ? Dimensions.get('window').height * 0.5 : Dimensions.get('window').height * 0.5742,
        paddingHorizontal: Dimensions.get('window').width * 0.43733 * 0.08,
        paddingBottom: Dimensions.get('window').width * 0.43733 * 0.08,
        justifyContent: 'flex-end',
    },
    linearGradient2: {
        height: Dimensions.get('window').height * 0.5742,
        paddingHorizontal: Dimensions.get('window').width * 0.43733 * 0.08,
        paddingBottom: (ipad) ? Dimensions.get('window').width * 0.43733 * 0.42 : Dimensions.get('window').width * 0.43733 * 0.2,
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
    },
    instablockIpad: {
        width: Dimensions.get('window').width * 0.5 / 3,
        height: Dimensions.get('window').width * 0.88 * 0.1,
    },
    adjacent: {
        flexDirection: 'row'
    },
    crown: {
        position: 'absolute',
        right: 10,
        top: 10,
        height: 36,
        width: 36,
        tintColor: '#FFD700',

    }
});