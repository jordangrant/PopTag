import React, { Component } from 'react';
import {
    StyleSheet, View, Image, ImageBackground, Dimensions, TouchableOpacity,
    Animated, AsyncStorage, Text, TextInput, Keyboard, Platform, FlatList,
    Linking
} from 'react-native';
import { COMPANIES } from './xcompanies';
import { DEFAULT } from './xquestions';
import { shareOnFacebook, shareOnTwitter } from 'react-native-social-share';
import Spinner from 'react-native-loading-spinner-overlay';

export default class Challenge extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            rand: 0,
            summary: false,
            spinner: false
        };
    }

    componentWillMount() {
        this.animatedValue = new Animated.Value(1);
        this.state.rand = Math.round(Math.random() * 689);
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

    tweet() {
        shareOnTwitter({
            'text': DEFAULT.find(item => item.id === this.state.rand).question + " @poptagtv #poptag 🎈",
            //'link': 'https://artboost.com/',
            //'imagelink': global.uri,
            //or use image
            'image': global.uri,
        },
            (results) => {
                if(results == "not_available") {
                    Linking.openURL('itms-apps://itunes.apple.com/ca/app/twitter/id333903271?mt=8')
                }
                else if(results == "cancelled") {

                }
                else if (results == "success") {
                    this.props.success();
                }
            }
        );
    }

    _renderHeader = ({ item }) => (
        <View>
            <TouchableOpacity onPress={() => this.props.endQuestion()} style={styles.summarycontainertop} activeOpacity={1}>
                <Text style={[styles.summaryText]} numberOfLines={4}>{this.state.text}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.blue2} activeOpacity={1} onPress={() => this.tweet()}>
                <Image source={{ uri: 'twitter' }} style={{ height: 28, width: 28, tintColor: 'white' }} />
            </TouchableOpacity>
        </View>
    );

    _renderFooter = ({ item }) => (
        <View style={{ width: Dimensions.get('window').width * 0.05 }}/>
    );

    renderChallenge(animatedStyle) {
        return (
            <TouchableOpacity activeOpacity={1}
                onPressIn={this.handlePressIn.bind(this)}
                onPress={Keyboard.dismiss}
                onLongPress={() => this.props.endQuestion()}
                onPressOut={this.handlePressOut.bind(this)}>
                <Animated.View style={animatedStyle}>
                    <View style={styles.container}>
                    <Image source={{ uri: 'trophy' }} style={styles.trophy}/>
                        <Text style={styles.mainText} numberOfLines={5}>{DEFAULT.find(item => item.id === this.state.rand).question}</Text>
                    </View>

                        <TouchableOpacity style={styles.blue} activeOpacity={1} onPress={() => this.submit()}>
                            <Text style={styles.send}>Let's do it!</Text>
                        </TouchableOpacity>

                </Animated.View>
            </TouchableOpacity>
        )
    }

    renderSummary() {
        return <View
            style={{
                width: Dimensions.get('window').width, height: Dimensions.get('window').height * 0.7,
                backgroundColor: 'transparent', paddingTop: Dimensions.get('window').height * 0.1
            }}>
            <Spinner visible={this.state.spinner} textContent={"Loading..."} textStyle={{color: '#FFF'}} />

            <TouchableOpacity onPress={() => this.props.endQuestion()} style={styles.summaryquestion} activeOpacity={1}>
                <Text style={styles.mainText} numberOfLines={4}>{DEFAULT.find(item => item.id === this.state.rand).question}</Text>
            </TouchableOpacity>

            <View style={styles.summaryDivider} />

            <FlatList
                data={typeof DEFAULT.find(item => item.id === this.state.rand).responses !== 'undefined' ? this.shuffle(DEFAULT.find(item => item.id === this.state.rand).responses) : []}
                renderItem={({ item }) =>
                    <View style={styles.summarycontainerbottom}>
                        <Text style={styles.summaryText} numberOfLines={4}>{item}</Text>
                    </View>}
                scrollEnabled={true}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
                ListHeaderComponent={this._renderHeader}
                ListFooterComponent={typeof DEFAULT.find(item => item.id === this.state.rand).responses !== 'undefined' ? this._renderFooter : null}
            />

        </View>
    }

    render() {

        const animatedStyle = {
            transform: [{ scale: this.animatedValue }],
        };

        return (
            this.state.summary == false ? this.renderChallenge(animatedStyle) : this.renderSummary(animatedStyle)
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
        height: Dimensions.get('window').width * 0.35,
        // backgroundColor: '#4A90E2',
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        padding: 20,
        marginLeft: Dimensions.get('window').width * 0.1,
        marginRight: Dimensions.get('window').width * 0.05,
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
        padding: 20,
        // shadowColor: 'black',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.05,
        // shadowRadius: 4,
    },
    blue2: {
        position: 'absolute',
        top: Dimensions.get('window').width * 0.33,
        borderBottomLeftRadius: 13,
        borderBottomRightRadius: 13,
        width: Dimensions.get('window').width * 0.8,
        height: Dimensions.get('window').width * 0.88 * 0.15,
        backgroundColor: '#4A90E2',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        marginLeft: Dimensions.get('window').width * 0.1,
        padding: 20,
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
    trophy: {
        height: 31,
        width: 31,
        tintColor: '#FFD700'
    }
});