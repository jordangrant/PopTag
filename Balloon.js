import React, { Component } from 'react';
import {
    StyleSheet, View, Image, Dimensions, TouchableOpacity,
    Animated, Platform
} from 'react-native';

export default class Balloon extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.animatedValue = new Animated.Value(1);
    }

    handlePressIn() {
        if (Platform.OS === 'ios') {
            Animated.spring(this.animatedValue, {
                toValue: 2
            }).start()
        }
        else {
            Animated.spring(this.animatedValue, {
                toValue: 1.1
            }).start()
        }

        setTimeout(() => {
            this.pop()
          }, 300)
    }

    handlePressOut() {
        Animated.spring(this.animatedValue, {
            toValue: 1,
            friction: 5,
            tension: 5
        }).start()
    }

    pop() {
        if (this.props.popped === false) {
            this.props.playPop();
            this.props.pop(this.props.id);
        }
        else {
            this.props.playWoosh();
        }
    }

    render() {

        const animatedStyle = {
            transform: [{ scale: this.animatedValue }]
        }

        // var companysettings = this.props.groups.find(item => item.id === this.props.custom).description;
        // companysettings = JSON.parse(companysettings)
        // questions, bgcolor, wordmark, primaryicon, secondaryicon

        return (
            <TouchableOpacity activeOpacity={1} style={{ position: 'absolute', top: this.props.top, left: this.props.left }}
                onPressIn={this.handlePressIn.bind(this)}
                //onPress={() => this.pop()}
                onPressOut={this.handlePressOut.bind(this)}>

                <Animated.View style={[animatedStyle, styles.ballooncontainer]}>
                    {!this.props.popped ?
                        <Image style={styles.balloon}
                            source={{ uri: 'balloon', cache: 'force-cache' }} />
                        :
                        <Image resizeMode={'contain'} style={styles.poppedshrunk}
                            source={{ uri: 'pop', cache: 'force-cache' }} />
                    }
                </Animated.View>
            </TouchableOpacity>

        );
    }
}

const styles = StyleSheet.create({
    ballooncontainer: {
        height: Dimensions.get('window').height > 1020 ? 187.5 : 125,
        width: Dimensions.get('window').height > 1020 ? 187.5 : 125,
        alignContent: 'center',
        justifyContent: 'center'
    },
    balloon: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        flex: 1, width: undefined, height: undefined,
    },
    balloonshrunk: {
        // shadowColor: 'black',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.25,
        // shadowRadius: 4,
        flex: 1, width: undefined, height: undefined,
        margin: 18
    },
    popped: {
        // shadowColor: 'black',
        // shadowOffset: { width: 0, height: 1 },
        // shadowOpacity: 0.25,
        // shadowRadius: 4,
        flex: 1, width: undefined, height: undefined,
        margin: 0
    },
    poppedshrunk: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        flex: 1, width: undefined, height: undefined,
        margin: 25
    }
});
