import React, { Component } from 'react';
import {
    StyleSheet, View, Image, Dimensions, TouchableOpacity,
    Animated, AsyncStorage, Platform, FlatList, Text
} from 'react-native';
import { COMPANIES } from './xcompanies';
import { DEFAULT, WLUHOCO } from './xmissions';
import LinearGradient from 'react-native-linear-gradient';

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
                <Image source={{ uri: COMPANIES.find(item => item.id === this.props.data.id).cover }} style={styles.cell}>
                    <LinearGradient
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.5)']}
                        style={styles.linearGradient}>
                        <Text style={styles.summaryText} numberOfLines={1}>{COMPANIES.find(item => item.id === this.props.data.id).name}</Text>
                    </LinearGradient>

                </Image>
            </TouchableOpacity>
        );
    }
}

export default class Dialogue2 extends Component {
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
            <View style={{ justifyContent: 'center', alignItems: 'center', marginTop: Dimensions.get('window').height * 0.17 }}>
                <FlatList
                    data={COMPANIES}
                    renderItem={this._renderItem}
                    scrollEnabled
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={this._renderHeader}
                    showsHorizontalScrollIndicator={false}
                    numColumns={2}
                />
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 13,
        width: Dimensions.get('window').width * 0.904,
        height: Dimensions.get('window').width * 0.904 * 0.12684,
        backgroundColor: 'white',
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginVertical: 6,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    summaryText: {
        color: 'white',
        fontWeight: '600',
        fontSize: Dimensions.get('window').width * 0.042,
        backgroundColor: 'transparent'
    },
    summarycontainerbottom: {
        borderRadius: 13,
        width: Dimensions.get('window').width * 0.43733,
        height: Dimensions.get('window').width * 0.43733 * 0.829268,
        marginVertical: 6,
        marginHorizontal: 6,
        backgroundColor: 'white',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        overflow: 'hidden'
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
    },
    linearGradient: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingLeft: Dimensions.get('window').width * 0.43733 * 0.08,
        paddingBottom: Dimensions.get('window').width * 0.43733 * 0.08,
        borderRadius: 13,
    },
    cell: {
        width: Dimensions.get('window').width * 0.43733,
        height: Dimensions.get('window').width * 0.43733 * 0.829268,
        resizeMode: 'cover'
    }
});
