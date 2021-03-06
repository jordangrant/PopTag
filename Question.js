import React, { Component } from 'react';
import {
    StyleSheet, View, Image, Dimensions, TouchableOpacity,
    Animated, AsyncStorage, Text, TextInput, Keyboard, Platform, FlatList,
    Linking, NativeModules, ImageEditor, ImageStore
} from 'react-native';
import { shareOnFacebook, shareOnTwitter } from 'react-native-social-share';
import RNInstagramStoryShare from 'react-native-instagram-story-share';
import Spinner from 'react-native-loading-spinner-overlay';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import DEFAULT from './groups.json';
import Share from 'react-native-share';

const ipad = (Dimensions.get('window').height > 1020);
const iphonex = (Platform.OS === 'ios' && Dimensions.get('window').height > 800 && Dimensions.get('window').height < 1020);

export default class Question extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            rand: 0,
            summary: false,
            spinner: false,
            challenges: DEFAULT[0].challenges,
            share: false
        };
    }

    componentWillMount() {
        this.animatedValue = new Animated.Value(1);

        if (global.custom !== 68) {
            this.state.rand = Math.floor(Math.random() * this.props.challenges.length);
        } else {
            //Using preloaded questions because they have responses
            this.state.rand = Math.floor(Math.random() * DEFAULT[0].challenges.length);
        }
    }

    componentDidMount() {
        if (global.custom !== 68) {
            this.setState({ challenges: this.props.challenges });
        }
        else {
            this.setState({ challenges: DEFAULT[0].challenges });
        }
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

    submit() {
        this.refs.input.blur();
        this.props.submit();
        setTimeout(() => this.setState({ summary: true }), 500);
    }

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

    tweet() {
        if (Platform.OS == 'android') {
            global.screenshot = global.screenshot.replace("file://", "")
        }
        shareOnTwitter({
            'text': this.state.challenges[this.state.rand].description + " #poptag #" + this.props.groups.find(item => item.id === global.custom).name.replace(/\s+/g, '') + " 🎈",
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
            'text': "#poptag 🎈",
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

    _renderHeader = ({ item }) => (
        <View>
            <TouchableOpacity onPress={() => this.props.endQuestion()} style={styles.summarycontainertop} activeOpacity={1}>
                <Text style={[styles.summaryText]} numberOfLines={5}>{this.state.text}</Text>
            </TouchableOpacity>


            <TouchableOpacity activeOpacity={1} onPress={() => Share.open({
                title: "PopTag",
                message: this.state.challenges[this.state.rand].description + " #poptag 🎈",
                url: global.screenshot,
                subject: "PopTag 🎈"
            })} style={styles.blue2} activeOpacity={1}>
                {/* <TouchableOpacity activeOpacity={1} onPress={() => this.tweet()}>
                    <Image source={{ uri: 'blank' }} style={styles.instablock} />
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={1} onPress={() => this.insta()}>
                    <Image source={{ uri: 'instagramgradient' }} style={styles.instablock} />
                </TouchableOpacity> */}

                {/* <TouchableOpacity activeOpacity={1} onPress={() => Share.open({
                    title: "PopTag",
                    message: this.state.challenges[this.state.rand].description + " #poptag 🎈",
                    url: global.screenshot,
                    subject: "PopTag 🎈" })}>
                    <View style={[styles.instablock, { backgroundColor: '#3B5998' }]} />
                </TouchableOpacity> */}

                {/* <TouchableOpacity onPress={() => this.tweet()} style={styles.left} activeOpacity={1}>
                    <Image source={{ uri: 'twitter' }} style={styles.icon} />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => this.insta()} style={styles.middle} activeOpacity={1}>
                    <Image source={{ uri: 'instagramicon' }} style={styles.icon} />
                </TouchableOpacity> */}

                <TouchableOpacity onPress={() => Share.open({
                    title: "PopTag",
                    message: this.state.challenges[this.state.rand].description + " #poptag 🎈",
                    url: global.screenshot,
                    subject: "PopTag 🎈"
                })}
                    style={styles.middle} activeOpacity={1}>
                    <Image source={{ uri: 'share' }} style={styles.icon} />
                </TouchableOpacity>
            </TouchableOpacity>
        </View>
    );

    _renderFooter = ({ item }) => (
        <View style={{ width: Dimensions.get('window').width * 0.05 }} />
    );

    renderQuestion(animatedStyle) {
        var question = this.state.challenges[this.state.rand].description;
        var qlength = question.length;

        return (
            <TouchableOpacity activeOpacity={1}
                onPressIn={this.handlePressIn.bind(this)}
                onPress={Keyboard.dismiss}
                onLongPress={() => this.props.endQuestion()}
                onPressOut={this.handlePressOut.bind(this)}>
                <Animated.View style={animatedStyle}>
                    <View style={this.state.text !== '' ? styles.container2 : styles.container}>
                        <Text style={[styles.mainText, { fontSize: qlength > 140 ? Dimensions.get('window').width * 0.031 : qlength > 110 ? Dimensions.get('window').width * 0.036 : (ipad) ? Dimensions.get('window').width * 0.038 : Dimensions.get('window').width * 0.042 }]}
                            numberOfLines={5}>{question}</Text>

                        <View style={styles.inputcontainer}>
                            <TextInput
                                ref="input"
                                style={[styles.subtext, { width: Dimensions.get('window').width * 0.75 * 0.88, textAlign: 'center' }]}
                                autoFocus={true}
                                placeholder={'Type something…'}
                                placeholderTextColor={'rgba(74,74,74,0.5)'}
                                onChangeText={(text) => this.setState({ text })}
                                value={this.state.text}
                                //onSubmitEditing={() => this.props.submit()}
                                enablesReturnKeyAutomatically={true}
                                returnKeyType={'done'}
                                blurOnSubmit={true}
                                multiline={true}
                                numberOfLines={2}
                                spellCheck={false}
                                underlineColorAndroid={'transparent'}
                            />
                        </View>
                    </View>

                    {this.state.text !== '' ?
                        <TouchableOpacity style={styles.blue} activeOpacity={1} onPress={() => this.submit()}>
                            <Text style={styles.send}>Send</Text>
                        </TouchableOpacity>
                        : null}

                </Animated.View>
            </TouchableOpacity>
        )
    }

    renderSummary() {
        var question = this.state.challenges[this.state.rand].description;

        return <View
            style={{
                width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.7,
                backgroundColor: 'transparent', paddingTop: Dimensions.get('window').height * 0.1
            }}>
            <Spinner visible={this.state.spinner} textContent={"Loading..."} textStyle={{ color: '#FFF' }} />

            <TouchableOpacity onPress={() => this.props.endQuestion()} style={styles.summaryquestion} activeOpacity={1}>
                <Text style={[styles.mainText, { fontSize: question.length > 140 ? Dimensions.get('window').width * 0.031 : question.length > 110 ? Dimensions.get('window').width * 0.036 : Dimensions.get('window').width * 0.042 }]}
                    numberOfLines={5}>{question}</Text>
            </TouchableOpacity>

            <View style={styles.summaryDivider} />

            <FlatList
                data={typeof this.state.challenges[this.state.rand].responses !== 'undefined' ? this.shuffle(this.state.challenges[this.state.rand].responses) : []}
                renderItem={({ item }) =>
                    <View style={styles.summarycontainerbottom}>
                        <Text style={styles.summaryText} numberOfLines={4}>{item}</Text>
                    </View>}
                scrollEnabled={true}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                ListHeaderComponent={this._renderHeader}
                ListFooterComponent={typeof this.state.challenges[this.state.rand].responses !== 'undefined' ? this._renderFooter : null}
            />

        </View>
    }

    render() {

        const animatedStyle = {
            transform: [{ scale: this.animatedValue }],
        };

        return (
            this.state.summary == false ? this.renderQuestion(animatedStyle) : this.renderSummary(animatedStyle)
        );
    }
}


const styles = StyleSheet.create({
    icon: {
        height: (ipad) ? 52 : 28,
        width: (ipad) ? 52 : 28,
        tintColor: 'white'
    },
    left: {
        position: 'absolute',
        left: (ipad) ? Dimensions.get('window').width * 0.8 * (1 / 6) - 26 : Dimensions.get('window').width * 0.8 * (1 / 6) - 14,
        height: (ipad) ? 52 : 28,
        width: (ipad) ? 52 : 28,
    },
    middle: {
        position: 'absolute',
        left: (ipad) ? Dimensions.get('window').width * 0.8 * (3 / 6) - 26 : Dimensions.get('window').width * 0.8 * (3 / 6) - 14,
        height: (ipad) ? 52 : 28,
        width: (ipad) ? 52 : 28,
    },
    right: {
        position: 'absolute',
        left: (ipad) ? Dimensions.get('window').width * 0.8 * (5 / 6) - 26 : Dimensions.get('window').width * 0.8 * (5 / 6) - 14,
        height: (ipad) ? 52 : 28,
        width: (ipad) ? 52 : 28,
    },
    summaryquestion: {
        borderRadius: (ipad) ? 26 : 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.25,
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 5,
        // shadowColor: 'black',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.05,
        // shadowRadius: 4,
    },
    summarycontainertop: {
        borderTopLeftRadius: (ipad) ? 26 : 13,
        borderTopRightRadius: (ipad) ? 26 : 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.38,
        // backgroundColor: '#4A90E2',
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 5,
        marginLeft: Dimensions.get('window').width * 0.1,
        marginRight: Dimensions.get('window').width * 0.05,
    },
    summarycontainerbottom: {
        borderRadius: (ipad) ? 26 : 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.25,
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 5,
        marginRight: Dimensions.get('window').width * 0.05,
    },
    container: {
        borderRadius: (ipad) ? 26 : 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.88 * 0.52,
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        padding: (ipad) ? 40 : 20,
        marginBottom: Dimensions.get('window').height * 0.23,
        // shadowColor: 'black',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.05,
        // shadowRadius: 4,
    },
    container2: {
        borderTopLeftRadius: (ipad) ? 26 : 13,
        borderTopRightRadius: (ipad) ? 26 : 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.88 * 0.52,
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        padding: (ipad) ? 40 : 20,
        marginBottom: Dimensions.get('window').height * 0.23,
        // shadowColor: 'black',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.05,
        // shadowRadius: 4,
    },
    blue: {
        position: 'absolute',
        top: Dimensions.get('window').width * 0.88 * 0.52 - (Dimensions.get('window').width * 0.88 * 0.15 * 0.13),
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
        top: Dimensions.get('window').width * 0.33,
        borderBottomLeftRadius: (ipad) ? 26 : 13,
        borderBottomRightRadius: (ipad) ? 26 : 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.88 * 0.15,
        //backgroundColor: '#4A90E2',
        backgroundColor: '#3B5998',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: Dimensions.get('window').width * 0.1,
        flexDirection: 'row',
        overflow: 'hidden'
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
        textAlign: 'center',
        marginVertical: 11,
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
        color: 'black',
        fontWeight: '600',
        fontSize: Dimensions.get('window').width * 0.049,
        textAlign: 'center',
        marginVertical: 10
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
    instablock: {
        width: Dimensions.get('window').width * 0.8 / 3,
        height: Dimensions.get('window').width * 0.88 * 0.15,
    }
});