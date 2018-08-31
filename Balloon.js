import React, { Component } from 'react';
import {
    StyleSheet, View, Image, ImageBackground, Dimensions, TouchableOpacity,
    Animated, AsyncStorage
} from 'react-native';

export default class Balloon extends Component {
    constructor(props) {
        super(props);
    }

    componentWillMount() {
        this.animatedValue = new Animated.Value(1);
    }

    handlePressIn() {
        Animated.spring(this.animatedValue, {
            toValue: 1.5
        }).start()
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
            this.props.pop(this.props.id);
        }
    }

    render() {

        const animatedStyle = {
            transform: [{ scale: this.animatedValue }]
        }

        return (
            <TouchableOpacity activeOpacity={1} style={{ position: 'absolute', top: this.props.top, left: this.props.left }}
                onPressIn={this.handlePressIn.bind(this)}
                onPress={() => this.pop()}
                onPressOut={this.handlePressOut.bind(this)}>

                <Animated.View style={animatedStyle}>
                    {!this.props.popped ?
                        <Image style={{ height: 125, width: 125, shadowColor: 'black', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}
                            source={{ uri: 'balloon' }} />
                        :
                        <Image style={{ height: 59, width: 77, marginHorizontal: 24, marginVertical: 33 }}
                            source={{ uri: 'pop' }} />
                    }
                </Animated.View>
            </TouchableOpacity>

        );
    }
}

const styles = StyleSheet.create({

});
