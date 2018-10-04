import React, { Component } from 'react';
import {
    StyleSheet, View, Image, ImageBackground, Dimensions, TouchableOpacity,
    Animated, AsyncStorage, Platform, FlatList, Text
} from 'react-native';
import { COMPANIES } from './xcompanies';
import { DEFAULT, WLUHOCO } from './xmissions';

class MyListItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            following: '',
        };

    }

    render() {

        return (
            <TouchableOpacity activeOpacity={1} onPress={() => this.props.changeCustom(this.props.data.id)}
            style={styles.summarycontainerbottom}>
                <Text style={styles.summaryText} numberOfLines={1}>{COMPANIES.find(item => item.id === this.props.data.id).name}</Text>
            </TouchableOpacity>
        );
    }
}

export default class Slider extends Component {
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

    _renderHeader = ({ item }) => (
        <TouchableOpacity activeOpacity={1} style={styles.container} >
            <Image style={styles.search} source={{ uri: 'search' }} />
        </TouchableOpacity>
    );

    _renderItem = ({ item, index }) => (
        <MyListItem
            data={item}
            index={index}
            success={this.props.success}
            changeCustom={this.props.changeCustom}
        />
    );

    render() {

        const animatedStyle = {
            transform: [{ scale: this.animatedValue }]
        }

        return (
            <FlatList
                    data={COMPANIES}
                    renderItem={this._renderItem}
                    scrollEnabled
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={this._renderHeader}
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                />

        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 13,
        width: Dimensions.get('window').width * 0.15,
        height: Dimensions.get('window').width * 0.15 * 1.459,
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginVertical: 6,
        marginLeft: Dimensions.get('window').width * (1-0.90666)/2,
    },
    summaryText: {
        color: 'black',
        fontWeight: '600',
        fontSize: Dimensions.get('window').width * 0.052,
    },
    summarycontainerbottom: {
        borderRadius: 13,
        width:  Dimensions.get('window').width * 0.15 * 1.459 * 1.2022,
        height: Dimensions.get('window').width * 0.15 * 1.459,
        padding: 4,
        marginVertical: 6,
        marginHorizontal: 6,
        backgroundColor: 'white',
        alignSelf: 'center',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4
    },
    inputcontainer: {
        borderRadius: 7,
        backgroundColor: '#D8D8D8',
        width: Dimensions.get('window').width * 0.75 * 0.88888,
        height: Dimensions.get('window').width * 0.75 * 0.88888 * 0.19758,
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center'
    },
    mainText: {
        color: 'black',
        fontWeight: '600',
        fontSize: Dimensions.get('window').width * 0.05,
        textAlign: 'center',
        marginVertical: 10
    },
    subtext: {
        color: '#4A4A4A',
        fontSize: 15,
        textAlign: 'center'
    },
    search: {
        height: 30,
        width: 30,
        tintColor: 'black'
    }
});
