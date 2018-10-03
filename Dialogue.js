import React, { Component } from 'react';
import {
    StyleSheet, View, Image, ImageBackground, Dimensions, TouchableOpacity,
    Animated, AsyncStorage, Text, TextInput, Keyboard, Platform, FlatList
} from 'react-native';
import { MISSIONS, WLUHOCO } from './entries2';

class MyListItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            following: '',
        };

    }

    componentWillMount() {
        this.animatedValue = new Animated.Value(1);
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
        }).start();
    }

    handleAdd(following) {
        const index = global.palette.indexOf(this.props.data.id);

        if (following) {
            global.palette.splice(index, 1);
            this.forceUpdate()
        } else {
            global.palette = global.palette.concat(this.props.data.id);
            this.props.success();
            this.forceUpdate()
        }

    }

    render() {
        var uri = false;

        (global.palette).forEach(id => {
            if (id == this.props.data.id) {
                uri = true;
            }
        })

        const colors = ['#FDB82A', '#F78119', '#E0393E', '#963D97', '#079CDB', '#62BA47'];

        const animatedStyle = {
            transform: [{ scale: this.animatedValue }],
        };
        return (
            <TouchableOpacity activeOpacity={1} style={[styles.summarycontainerbottom, { backgroundColor: colors[this.props.index % 6] }]}
                              onPress={() => this.handleAdd(uri)}>
             {/* <TouchableOpacity activeOpacity={1} style={styles.summarycontainerbottom}
                                onPress={() => this.handleAdd(uri)}> */}
                <Text style={styles.summaryText} numberOfLines={1}>{this.props.data.name}</Text>
                <Image style={styles.starimage} source={{ uri: uri ? 'starclosed' : 'staropen' }} />
            </TouchableOpacity>
        );
    }
}

export default class Dialogue extends Component {
    constructor(props) {
        super(props);
        this.state = {
            text: '',
            rand: 0,
            following: '',
        };
    }

    componentWillMount() {
        this.state.rand = Math.round(Math.random() * 25);
    }

    componentWillUnmount() {
        AsyncStorage.setItem('palette', JSON.stringify(global.palette));
    }

    _renderHeader = ({ item }) => (
        <TouchableOpacity activeOpacity={1} style={styles.container} onPress={() => this.props.toggleDialogue()}>
            <Text style={styles.mainText} numberOfLines={3}>Our world is full of unique, amazing people - go meet them!</Text>
        </TouchableOpacity>
    );

    _renderItem = ({ item, index }) => (
        <MyListItem
            data={item}
            index={index}
            success={this.props.success}
        />
    );

    render() {
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: Dimensions.get('window').height * 0.17}}>

                <FlatList
                    data={MISSIONS}
                    renderItem={this._renderItem}
                    scrollEnabled
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={this._renderHeader}
                />
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 13,
        width: Dimensions.get('window').width * 0.90666,
        height: Dimensions.get('window').width * 0.90666 * 0.3,
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        padding: 15,
        marginBottom: 6,
        alignSelf: 'center'
    },
    summaryText: {
        color: 'white',
        fontWeight: '600',
        fontSize: Dimensions.get('window').width * 0.052,
    },
    summarycontainerbottom: {
        borderRadius: 13,
        width: Dimensions.get('window').width * 0.90666,
        height: Dimensions.get('window').width * 0.90666 * 0.2,
        padding: 20,
        marginVertical: 6,
        marginHorizontal: 6,
        backgroundColor: 'white',
        alignSelf: 'center',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    starimage: {
        height: 30,
        width: 30
    }
});
