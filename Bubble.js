import React, { Component } from 'react';
import {
    StyleSheet, View, Image, Dimensions, TouchableOpacity,
    Animated, Platform, Text
} from 'react-native';

const ipad = (Dimensions.get('window').height > 1020);
const iphonex = (Platform.OS === 'ios' && Dimensions.get('window').height > 800 && Dimensions.get('window').height < 1020);

export default class Bubble extends Component {
    constructor(props) {
        super(props);

    }

    componentWillMount() {
        this.animatedValue = new Animated.Value(1);
    }

    handlePressIn() {
        if (Platform.OS === 'ios') {
            Animated.spring(this.animatedValue, {
                toValue: 1.4
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

        return (
            <TouchableOpacity style={{ flexGrow: 1 }}
                onPressIn={this.handlePressIn.bind(this)}
                onPress={() => this.props.press(this.props.id)}
                onLongPress={() => this.props.longPress(this.props.id)}
                onPressOut={this.handlePressOut.bind(this)}>
                <Animated.View style={[animatedStyle, this.props.state == 'default' ? styles.bubble : styles.bubbleAlternate]}>
                    <Text style={this.props.state == 'default' ? styles.bubbleTextDefault :
                        this.props.state == 'active' ? styles.bubbleText2 : styles.bubbleTextComplete}>
                        {this.props.question}
                    </Text>

                    {this.props.state == 'completed' ?
                    <Image source={{ uri: 'check' }} style={styles.check}/>
                    : null}
                </Animated.View>
            </TouchableOpacity>

        );
    }
}

const styles = StyleSheet.create({
    bubble: {
        maxHeight: Dimensions.get('window').width * 0.30,
        //maxWidth: Dimensions.get('window').width / 2 - 20,
        padding: 15,
        margin: 5,
        borderRadius: (ipad) ? 26 : 13,
        backgroundColor: 'rgba(255,255,255,0.54)',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    bubbleAlternate: {
        maxHeight: Dimensions.get('window').width * 0.30,
        //maxWidth: Dimensions.get('window').width / 2 - 2,
        padding: 15,
        margin: 5,
        borderRadius: (ipad) ? 26 : 13,
        backgroundColor: '#4A90E2',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    bubbleTextDefault: {
        fontWeight: '600',
        fontSize: Dimensions.get('window').width * 0.039,
    },
    bubbleText2: {
        color: 'white',
        fontWeight: '600',
        fontSize: Dimensions.get('window').width * 0.039,
    },
    bubbleTextComplete: {
        color: 'white',
        opacity: 0.5,
        fontWeight: '600',
        fontSize: Dimensions.get('window').width * 0.039,
    },
    check: {
        height: 20,
        width: 20,
        tintColor: '#FFD700',
        position: 'absolute',
        alignSelf: 'center'
    }
});
