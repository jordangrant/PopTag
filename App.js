/**
 * © Jordan Grant 2018
 */

import React, { Component } from 'react';
import {
    AppRegistry, StyleSheet, Text, View, TouchableOpacity, Dimensions, Keyboard,
    Image, Animated, AsyncStorage, CameraRoll, Platform, Linking, PermissionsAndroid
} from 'react-native';
import { captureScreen } from "react-native-view-shot";
import RNShakeEvent from 'react-native-shake-event';
import Balloon from './Balloon';
import Question from './Question';
import Challenge from './Challenge';
import Dialogue from './Dialogue2';
import Contacts from 'react-native-contacts';
import Sound from 'react-native-sound';
import Toast, { DURATION } from 'react-native-easy-toast';
import { colors } from './colors';

//const width = Dimensions.get('window').width * 0.264;
const width = Dimensions.get('window').width * 0.43733;
//const height = width * 0.5656;
const height = width * 0.34146;

const logoHeight = (Platform.OS === 'ios' && Dimensions.get('window').height > 800) ? 50 : 40;
const topR1 = (Platform.OS === 'ios' && Dimensions.get('window').height > 800) ? Dimensions.get('window').height * 0.25 : Dimensions.get('window').height * 0.211;
const topR2 = topR1 + 62;
const topR3 = topR1 + 138;
const topR4 = topR1 + 206;
const topR5 = topR1 + 277;
const leftC1 = 0;
const leftC2 = Dimensions.get('window').width / 2 - 62.5;
const leftC3 = Dimensions.get('window').width - 125;

console.disableYellowBox = true;

var woosh = new Sound('woosh.m4a', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
        console.log('failed to load the sound', error);
        return;
    }
});

var pop = new Sound('pop.m4a', Sound.MAIN_BUNDLE, (error) => {
    if (error) {
        console.log('failed to load the sound', error);
        return;
    }
});

const GIFS = {
    image0: require('./assets/office.gif'),
    image1: require('./assets/coke.gif'),
    image2: require('./assets/cosmo.gif'),
    image3: require('./assets/baseball.gif'),
    image4: require('./assets/hilary.gif'),
    image5: require('./assets/peanuts.gif'),
    image6: require('./assets/chris.gif'),
}

export default class PopTag extends Component {
    constructor(props) {
        super(props);

        Sound.setCategory('Ambient');

        this.state = {
            balloons: [
                { id: 0, top: topR2, left: leftC1, popped: false },
                { id: 1, top: topR1, left: leftC2, popped: false },
                { id: 2, top: topR2, left: leftC3, popped: false },
                { id: 3, top: topR3, left: leftC2, popped: false },
                { id: 4, top: topR4, left: leftC1, popped: false },
                { id: 5, top: topR5, left: leftC2, popped: false },
                { id: 6, top: topR4, left: leftC3, popped: false },
            ],
            displayQuestion: false,
            displayChallenge: false,
            displayGif: false,
            background: '',
            gif: 0,
            dialogue: false,
            bottomHeight: 25,
            message: 'testestestest',
            custom: 68,
            loading: true,
            camera: false,
            filter: 'none',
            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik56UXdOa1U0UXpreU9VSTRPRVEyUkRNMFFUQXlNelZHUXpReE9FTXhOVE5ETVRBM05FTXdRdyJ9.eyJpc3MiOiJodHRwczovL3B4MS5hdXRoMC5jb20vIiwic3ViIjoiZmFjZWJvb2t8MTAyMDc5NjUzNTgzMzIzNjQiLCJhdWQiOlsiYXBpLmNoYWxldGFwcC5kZSIsImh0dHBzOi8vcHgxLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE1NDAyNTUwODUsImV4cCI6MTU0Mjg0NzA4NSwiYXpwIjoiRVVzN0V4ekVPdzZLcjVjd1dmNUk2bkg2M1BwUlJ5OUgiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG9mZmxpbmVfYWNjZXNzIn0.nwsWFHin4HC_SsvNN3wtK9vgd3Z-QCeRjcE_G_dm47Y_sFKx4HiHVOnfl-2mUHTHv2Z1oZrhVvbmxuezwNjdyqZhjc1nnChNd2eXgWrtps8fq8tJ4C7_XNFhfyzBXTAVib3Y5skJaLw-7i7gFDbs8oBap-bpW1btvx539Cqm5vrPEp2JWHb6nMwgC1UKfsGOK0NLaQDeb8W8b-qln0v8kq7v2pDO7gYIt1KN4H16oTFSbbcaduAdMtF2aP0UCjzWRsuk-F6NxRhMnWDPyAEivWbNkqdSmcehiNsgl7juzpb8RN-1cvo-emEjkLDUlmYO6jRLM-u-Qai7eMYrUADANA',
            groups: [
                { id: 68, name: 'PopTag', description: "[\"questions\", \"blue\", \"null\", \"null\", \"null\"]", image: {}, challenges: [] },
            ],
            challenges: []
        };
    }

    componentWillMount() {
        AsyncStorage.getItem('token').then(b => {
            if (b !== null) {
                global.token = b;
                this.setState({ token: b });
            }
            else {
                global.token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik56UXdOa1U0UXpreU9VSTRPRVEyUkRNMFFUQXlNelZHUXpReE9FTXhOVE5ETVRBM05FTXdRdyJ9.eyJpc3MiOiJodHRwczovL3B4MS5hdXRoMC5jb20vIiwic3ViIjoiZmFjZWJvb2t8MTAyMDc5NjUzNTgzMzIzNjQiLCJhdWQiOlsiYXBpLmNoYWxldGFwcC5kZSIsImh0dHBzOi8vcHgxLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE1NDAyNTUwODUsImV4cCI6MTU0Mjg0NzA4NSwiYXpwIjoiRVVzN0V4ekVPdzZLcjVjd1dmNUk2bkg2M1BwUlJ5OUgiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG9mZmxpbmVfYWNjZXNzIn0.nwsWFHin4HC_SsvNN3wtK9vgd3Z-QCeRjcE_G_dm47Y_sFKx4HiHVOnfl-2mUHTHv2Z1oZrhVvbmxuezwNjdyqZhjc1nnChNd2eXgWrtps8fq8tJ4C7_XNFhfyzBXTAVib3Y5skJaLw-7i7gFDbs8oBap-bpW1btvx539Cqm5vrPEp2JWHb6nMwgC1UKfsGOK0NLaQDeb8W8b-qln0v8kq7v2pDO7gYIt1KN4H16oTFSbbcaduAdMtF2aP0UCjzWRsuk-F6NxRhMnWDPyAEivWbNkqdSmcehiNsgl7juzpb8RN-1cvo-emEjkLDUlmYO6jRLM-u-Qai7eMYrUADANA';
            }
        })

        AsyncStorage.getItem('balloons').then(b => {
            if (b !== null) {
                this.setState({ balloons: JSON.parse(b) });
            }
        })

        AsyncStorage.getItem('gif').then(b => {
            if (b !== null) {
                this.setState({ gif: parseInt(b) });
            }
        })

        AsyncStorage.getItem('custom').then(custom => {
            if (custom !== null) {
                global.custom = parseInt(custom);
                this.setState({ custom: parseInt(custom) });

                AsyncStorage.getItem('challenges').then(b => {
                    if (b !== null) {
                        this.setState({ challenges: JSON.parse(b) });
                    }
                    else {
                        this.updateChallenges(parseInt(custom));
                    }
                })
            } else {
                AsyncStorage.setItem('custom', '68');
                global.custom = 68;
                this.setState({ custom: 68 });

                AsyncStorage.getItem('challenges').then(b => {
                    if (b !== null) {
                        this.setState({ challenges: JSON.parse(b) });
                    }
                    else {
                        this.updateChallenges(68);
                    }
                })
            }
        });

        AsyncStorage.getItem('filter').then(b => {
            if (b !== null) {
                global.filter = b;
                this.setState({ filter: b });
            }
            else {
                global.filter = 'none'
            }
        })

        AsyncStorage.getItem('groups').then(b => {
            if (b !== null) {
                this.setState({ groups: JSON.parse(b) });
                this.setState({ loading: false });
            }
            else {
                if (global.token == 'undefined') {
                    global.token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik56UXdOa1U0UXpreU9VSTRPRVEyUkRNMFFUQXlNelZHUXpReE9FTXhOVE5ETVRBM05FTXdRdyJ9.eyJpc3MiOiJodHRwczovL3B4MS5hdXRoMC5jb20vIiwic3ViIjoiZmFjZWJvb2t8MTAyMDc5NjUzNTgzMzIzNjQiLCJhdWQiOlsiYXBpLmNoYWxldGFwcC5kZSIsImh0dHBzOi8vcHgxLmF1dGgwLmNvbS91c2VyaW5mbyJdLCJpYXQiOjE1NDAyNTUwODUsImV4cCI6MTU0Mjg0NzA4NSwiYXpwIjoiRVVzN0V4ekVPdzZLcjVjd1dmNUk2bkg2M1BwUlJ5OUgiLCJzY29wZSI6Im9wZW5pZCBwcm9maWxlIGVtYWlsIG9mZmxpbmVfYWNjZXNzIn0.nwsWFHin4HC_SsvNN3wtK9vgd3Z-QCeRjcE_G_dm47Y_sFKx4HiHVOnfl-2mUHTHv2Z1oZrhVvbmxuezwNjdyqZhjc1nnChNd2eXgWrtps8fq8tJ4C7_XNFhfyzBXTAVib3Y5skJaLw-7i7gFDbs8oBap-bpW1btvx539Cqm5vrPEp2JWHb6nMwgC1UKfsGOK0NLaQDeb8W8b-qln0v8kq7v2pDO7gYIt1KN4H16oTFSbbcaduAdMtF2aP0UCjzWRsuk-F6NxRhMnWDPyAEivWbNkqdSmcehiNsgl7juzpb8RN-1cvo-emEjkLDUlmYO6jRLM-u-Qai7eMYrUADANA';
                }
                this.getGroups().then((groups) => {
                    AsyncStorage.setItem('groups', JSON.stringify(groups));
                    this.setState({ groups: groups });
                    this.setState({ loading: false });
                })
            }
        })

        this.animatedValue = new Animated.Value(1);

        // RNShakeEvent.addEventListener('shake', () => {
        //     if (this.state.bgColor < 4) {
        //         this.setState({ bgColor: (this.state.bgColor + 1) });
        //         this.save();
        //         this.forceUpdate();
        //     }
        //     else {
        //         this.setState({ bgColor: 0 });
        //         this.save();
        //         this.forceUpdate();
        //     }
        // });

        this.forceUpdate();
    }

    componentDidMount() {
        this.refreshToken().then((response) => {
            global.token = response.token;
            this.setState({ token: response.token });
        })
    }

    componentWillUnmount() {
        //RNShakeEvent.removeEventListener('shake');
    }

    async save() {
        await AsyncStorage.setItem('balloons', JSON.stringify(this.state.balloons));
        await AsyncStorage.setItem('gif', JSON.stringify(this.state.gif));
        await AsyncStorage.setItem('custom', JSON.stringify(this.state.custom));
        await AsyncStorage.setItem('groups', JSON.stringify(this.state.groups));
        await AsyncStorage.setItem('filter', JSON.stringify(this.state.filter));
        await AsyncStorage.setItem('token', JSON.stringify(this.state.token));
        console.log('balloons:' + JSON.stringify(this.state.balloons));
    }

    async getGroups() {
        return fetch('https://api.chaletapp.de/groups', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${global.token}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                return responseJson
            })
            .catch((error) => {
                console.error(error);
            });
    }

    async refreshToken() {
        return fetch('https://s3.us-east-2.amazonaws.com/chalet2/poptag/token.json')
            .then((response) => response.json())
            .then((responseJson) => {
                console.log('Latest token fetched.')
                return responseJson
            })
            .catch((error) => {
                console.error(error);
            });
    }

    async getChallenges(custom) {
        return fetch(`https://api.chaletapp.de/groups/${custom}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${global.token}`,
            }
        })
            .then((response) => response.json())
            .then((responseJson) => {
                return responseJson[0].challenges
            })
            .catch((error) => {
                console.error(error);
            });
    }

    // updateChallenges(custom) {

    //     this.getChallenges(custom).then((challenges) => {
    //         AsyncStorage.setItem('challenges', JSON.stringify(challenges));
    //         this.setState({ challenges: challenges });
    //     })
    //         .then(() => console.log('Challenges fetched and loaded.'))
    // }

    updateChallenges(custom) {
        return new Promise(async (resolve, reject) => {
            try {
                this.getChallenges(custom).then((challenges) => {
                    AsyncStorage.setItem('challenges', JSON.stringify(challenges));
                    this.setState({ challenges: challenges });
                    console.log('Challenges fetched and loaded.')
                    resolve(true);
                })
            } catch (ex) {
                reject();
            }
        });
    }

    update() {
        this.getGroups().then((groups) => {
            AsyncStorage.setItem('groups', JSON.stringify(groups));
            this.setState({ groups: groups });
        })
            .then(() => console.log('Groups re-retrieved from DB and saved.'))

        this.getChallenges(this.state.custom).then((challenges) => {
            AsyncStorage.setItem('challenges', JSON.stringify(challenges));
            this.setState({ challenges: challenges });
        })
            .then(() => console.log('Challenges fetched and loaded.'))

    }

    handlePressIn() {
        if (Platform.OS === 'ios') {
            Animated.spring(this.animatedValue, {
                toValue: 1.5
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

    playWoosh() {
        woosh.play((success) => {
            if (success) {
                console.log('successfully finished playing');
            } else {
                console.log('playback failed due to audio decoding errors');
            }
        });
    }

    playPop() {
        pop.play((success) => {
            if (success) {
                console.log('successfully finished playing');
            } else {
                console.log('playback failed due to audio decoding errors');
            }
        });
    }

    dismissGif() {
        if (this.state.gif < 6) {
            this.setState({ gif: (this.state.gif + 1) });
            this.save();
        }
        else {
            this.setState({ gif: 0 });
            this.save();
        }

        this.setState({ displayGif: false })
    }

    navigateToInstagram() {
        if (Platform.OS === 'ios') {
            Linking.openURL('instagram://user?username=poptagtv');
            setTimeout(() => Linking.openURL('https://www.instagram.com/poptagtv'), 10);
        }
        else {
            Linking.openURL('https://www.instagram.com/poptagtv')
        }
    }

    changeCustom(custom) {
        this.updateChallenges(custom).then((res) => {
            if (res == true) {
                global.custom = custom;
                this.setState({ custom: custom });
                console.log('Custom successfully changed.');
                this.toggleDialogue();
                this.save();
            }
            else {
                alert('Failed to retrieve new content. Please check your network settings and try again.')
            }
        })
    }

    changeFilter(filter) {
        if (global.filter !== filter) {
            global.filter = filter;
            this.setState({ filter: filter });
            this.save();
        }
        else {
            global.filter = 'none';
            this.setState({ filter: 'none' });
            this.save();
        }
        console.log('Filter changed to ' + filter);
    }

    popBalloon(id) {
        const tempBalloons = this.state.balloons;
        const balloon = tempBalloons.filter(b => b.id === id)[0];
        const index = tempBalloons.indexOf(balloon);
        balloon.popped = true;
        tempBalloons[index] = balloon;
        this.setState({ balloons: tempBalloons });

        if (tempBalloons.filter(b => b.popped).length === tempBalloons.length) {
            this.resetBalloons();
        }

        var companysettings = this.state.groups.find(item => item.id === this.state.custom).description;
        companysettings = JSON.parse(companysettings)

        if (companysettings[0].replace('verified', '') == 'questions') {
            this.setState({ displayQuestion: true });
        }
        else {
            this.setState({ displayChallenge: true });
        }

        this.save();
    }

    resetBalloons() {
        var balloons = this.state.balloons.map(b => {
            b.popped = false;
            return b;
        });
        this.setState({ displayGif: true });
        this.setState({ balloons: balloons });
    }

    async requestExternalStoragePermission(uri) {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                {
                    title: 'Storage Permission',
                    message: 'PopTag saves your responses to camera roll',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                CameraRoll.saveToCameraRoll(uri)
                    .then((newUri) => {
                        if (typeof newUri !== 'undefined') {
                            this.refs.toast.show('Saved to Camera Roll');
                        }
                    });
            } else {
                console.log("Camera Roll permission denied")
            }
        } catch (err) {
            console.error('Failed to request permission ', err);
            return null;
        }
    };

    submitAnswer() {
        if (Platform.OS === 'android') {
            Keyboard.dismiss();

            setTimeout(() =>
                captureScreen({
                    format: "jpg",
                    quality: 1
                })
                    .then(uri => {
                        global.screenshot = uri;
                        this.requestExternalStoragePermission(uri);
                    }));
        }
        else {
            captureScreen({
                format: "jpg",
                quality: 1
            })
                .then(uri => {
                    global.screenshot = uri;
                    CameraRoll.saveToCameraRoll(uri)
                        .then((newUri) => {
                            if (typeof newUri !== 'undefined') {
                                this.refs.toast.show('Saved to Camera Roll');
                            }
                        });
                })
        }
    }


    endQuestion() {
        this.setState({ displayQuestion: false, displayChallenge: false })
    }

    successTweet() {
        this.refs.toast.show('Posted! ✅');
    }

    successCameraRoll() {
        this.refs.toast.show('Saved to Camera Roll');
    }

    addContact() {
        var newPerson = {
            //familyName: "Attrac",
            //givenName: "Friedrich",
        }

        if (Platform.OS === 'ios') {
            Contacts.checkPermission((err, permission) => {
                if (err) throw err;

                //Contacts.PERMISSION_AUTHORIZED || Contacts.PERMISSION_UNDEFINED || Contacts.PERMISSION_DENIED

                if (permission === 'undefined') {
                    Contacts.requestPermission((err, permission) => {
                        if (permission === 'authorized') {
                            Contacts.openContactForm(newPerson, (err) => {
                                if (err) throw err;
                                // form is open
                            })
                        }
                    })
                }
                else if (permission === 'denied') {
                    Linking.openURL('app-settings:PopTag');
                }
                else {
                    Contacts.openContactForm(newPerson, (err) => {
                        if (err) throw err;
                        // form is open
                    })
                }
            })
        }
        else {
            Contacts.openContactForm(newPerson, (err) => {
                if (err) throw err;
                // form is open
            })
        }

    }

    toggleDialogue() {
        if (this.state.displayQuestion || this.state.displayChallenge) {
            this.endQuestion();
        }
        else if (this.state.displayGif) {
            this.dismissGif();
        }
        else {
            this.setState({ dialogue: !this.state.dialogue })
        }
    }

    _keyboardDidShow() {
        this.setState({ bottomHeight: Dimensions.get('window').height * 0.4 });
    }

    _keyboardDidHide() {
        this.setState({ bottomHeight: 25 });
    }

    renderBalloons() {
        if (this.state.challenges.length > 0) {
            return this.state.balloons.map(b =>
                <Balloon key={b.id} top={b.top} left={b.left} id={b.id} popped={b.popped} pop={this.popBalloon.bind(this)}
                    playPop={() => this.playPop()} playWoosh={() => this.playWoosh()} custom={this.state.custom}
                    groups={this.state.groups} />
            );
        }
        else {
            return <Text>No content yet.</Text>
        }
    }

    renderQuestion() {
        return <Question submit={this.submitAnswer.bind(this)} endQuestion={() => this.endQuestion()}
            toggleLoading={() => this.toggleLoading()} successTweet={() => this.successTweet()}
            groups={this.state.groups} challenges={this.state.challenges} />
    }

    renderChallenge() {
        return <Challenge submit={this.submitAnswer.bind(this)} endQuestion={() => this.endQuestion()}
            toggleLoading={() => this.toggleLoading()} successTweet={() => this.successTweet()}
            successCameraRoll={() => this.successCameraRoll()} groups={this.state.groups}
            camera={() => this.setState({ camera: !this.state.camera })} challenges={this.state.challenges} />
    }

    renderDialogue() {
        return <Dialogue changeCustom={(b) => this.changeCustom(b)} changeFilter={(b) => this.changeFilter(b)}
            toggleDialogue={this.toggleDialogue.bind(this)} groups={this.state.groups} />
    }

    renderGif() {
        return (
            <TouchableOpacity activeOpacity={1} onPress={() => this.dismissGif()}>
                <Image source={GIFS['image' + this.state.gif]} />
            </TouchableOpacity>
        )
    }

    render() {

        const animatedStyle = {
            transform: [{ scale: this.animatedValue }]
        }

        var companysettings = this.state.groups.find(item => item.id === this.state.custom);
        if (typeof companysettings !== 'undefined') {
            companysettings = JSON.parse(companysettings.description)
        }

        // questions, bgcolor, wordmark, primaryicon, secondaryicon

        return (
            <View style={styles.base}>
                {this.state.loading == true ?
                    <View />
                    :
                    <View style={[styles.container, { backgroundColor: companysettings[1] }]}>

                        <TouchableOpacity style={styles.headerBounding} activeOpacity={1}
                            onPressIn={this.handlePressIn.bind(this)}
                            onPress={this.state.displayQuestion ? () => this.endQuestion() : this.state.displayChallenge ? () => this.endQuestion() :
                                this.state.dialogue ? () => this.toggleDialogue() : this.state.displayGif ? () => this.dismissGif() : () => this.update()}
                            onPressOut={this.handlePressOut.bind(this)}>
                            <Animated.View style={[animatedStyle, { width: Dimensions.get('window').width * 0.7, height: Dimensions.get('window').width * 0.7 * 0.2461538462 }]}>
                                <Image style={styles.header} resizeMode={'contain'}
                                    source={{ uri: companysettings[2] == 'null' ? 'ptlogored' : companysettings[2], cache: 'force-cache' }} />
                            </Animated.View>
                        </TouchableOpacity>

                        {this.state.dialogue ? this.renderDialogue() : this.state.displayQuestion ? this.renderQuestion() : this.state.displayChallenge ? this.renderChallenge() :
                            this.state.displayGif ? this.renderGif() : this.renderBalloons()}

                        {/* {this.state.dialogue == false ?
                        <TouchableOpacity activeOpacity={1} style={[styles.button1, { bottom: this.state.bottomHeight }]} onPress={() => this.addContact()}>
                            <Image style={styles.contacts} source={{ uri: 'addressbookicon' }} />
                        </TouchableOpacity>
                        : null} */}

                        {!this.state.dialogue && !this.state.camera ?
                            <TouchableOpacity activeOpacity={1} style={[styles.button1, { bottom: this.state.bottomHeight }]} onPress={() => this.toggleDialogue()}>
                                <Image style={styles.ibutton} source={{ uri: this.state.displayQuestion || this.state.displayGif || this.state.displayChallenge ? 'home' : 'palette' }} />
                            </TouchableOpacity>
                            : null}

                        {!this.state.dialogue && !this.state.camera ?
                            <TouchableOpacity activeOpacity={1} style={[styles.button3, { bottom: this.state.bottomHeight }]} onPress={() => this.navigateToInstagram()}>
                                <Image style={styles.instagrambutton} source={{ uri: 'instagramicon' }} />
                            </TouchableOpacity>
                            : null}

                    </View>
                }

                <Toast
                    ref="toast"
                    style={{ backgroundColor: 'black' }}
                    position='bottom'
                    positionValue={Dimensions.get('window').height / 4.5}
                    fadeInDuration={200}
                    fadeOutDuration={1600}
                    opacity={0.4}
                    textStyle={{ color: 'white' }}
                />

            </View>
        );
    }
}


const styles = StyleSheet.create({
    base: {
        flex: 1,
        backgroundColor: 'transparent'
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button1: {
        position: 'absolute',
        left: 16,
        borderRadius: 8,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        backgroundColor: '#FD3B00',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        width: width,
        height: height,
    },
    button2: {
        position: 'absolute',
        borderRadius: 8,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        backgroundColor: '#4CAF50',
        alignSelf: 'center',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        width: width,
        height: height,
    },
    button3: {
        position: 'absolute',
        right: 16,
        borderRadius: 8,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        backgroundColor: '#4A90E2',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        width: width,
        height: height,
    },
    header: {
        //width: Dimensions.get('window').width * 0.7, height: Dimensions.get('window').width * 0.7 * 0.2461538462
        flex: 1, width: undefined, height: undefined,
    },
    headerBounding: {
        position: 'absolute',
        alignSelf: 'center',
        top: logoHeight,
    },
    boundingbox: {
        height: Dimensions.get('window').height * 0.68,
        width: Dimensions.get('window').width,
        backgroundColor: 'black',
        marginTop: 30,
    },
    contacts: {
        width: width * 0.303,
        height: width * 0.303 * 1.0778947368,
        tintColor: 'white'
    },
    instagrambutton: {
        width: 36,
        height: 36,
        tintColor: 'white'
    },
    ibutton: {
        width: 36,
        height: 36,
        tintColor: 'white'
    },
    woman: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height
    }
});

AppRegistry.registerComponent('PopTag', () => PopTag);
