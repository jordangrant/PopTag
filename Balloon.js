import React, { Component } from 'react';
import {
    StyleSheet, View, Image, ImageBackground, Dimensions, TouchableOpacity,
    Animated, AsyncStorage, Platform
} from 'react-native';
import { COMPANIES } from './xcompanies';

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

        return (
            <TouchableOpacity activeOpacity={1} style={{ position: 'absolute', top: this.props.top, left: this.props.left }}
                onPressIn={this.handlePressIn.bind(this)}
                //onPress={() => this.pop()}
                onPressOut={this.handlePressOut.bind(this)}>

                <Animated.View style={[animatedStyle, { height: 125, width: 125, 
                    alignContent: 'center', justifyContent: 'center' }]}>
                    {!this.props.popped ?
                        <Image style={[COMPANIES.find(item => item.id === this.props.custom).shrinkicon ? styles.balloonshrunk : styles.balloon, 
                            { tintColor: COMPANIES.find(item => item.id === this.props.custom).iconoverlay !== 'null' ? COMPANIES.find(item => item.id === this.props.custom).iconoverlay : null }]}
                            source={{ uri: COMPANIES.find(item => item.id === this.props.custom).icon }} />
                        :
                        <Image resizeMode={'contain'} style={[ COMPANIES.find(item => item.id === this.props.custom).shrinkiconalternate ? styles.poppedshrunk : styles.popped, {
                            tintColor: COMPANIES.find(item => item.id === this.props.custom).iconalternateoverlay !== 'null' ? COMPANIES.find(item => item.id === this.props.custom).iconalternateoverlay : null }]}
                            source={{ uri: COMPANIES.find(item => item.id === this.props.custom).iconalternate !== 'null' ? COMPANIES.find(item => item.id === this.props.custom).iconalternate : 'pop' }} />
                    }
                </Animated.View>
            </TouchableOpacity>

        );
    }
}

const styles = StyleSheet.create({
    balloon: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        flex: 1, width: undefined, height: undefined,
    },
    balloonshrunk: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        flex: 1, width: undefined, height: undefined,
        margin: 20
    },
    popped: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        flex: 1, width: undefined, height: undefined,
        margin: 0
    },
    poppedshrunk: {
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        flex: 1, width: undefined, height: undefined,
        margin: 25
    }
});
