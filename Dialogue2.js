import React, { Component } from 'react';
import {
    StyleSheet, View, Image, Dimensions, TouchableOpacity,
    Animated, AsyncStorage, Platform, FlatList, Text,
    TextInput
} from 'react-native';
import { COMPANIES } from './xcompanies';
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
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.5)']}
                        locations={[0, 0.5, 0.7, 1]}
                        style={styles.linearGradient}>
                        <View style={styles.aligner}>
                            <Text style={styles.summaryText} numberOfLines={1}>{COMPANIES.find(item => item.id === this.props.data.id).name}</Text>
                            <Image style={styles.trophy} source={{ uri: COMPANIES.find(item => item.id === this.props.data.id).type == 'challenges' ? 'trophy' : 'chatbubble' }} />
                        </View>
                    </LinearGradient>

                </Image>
            </TouchableOpacity>
        );
    }
}

export default class Dialogue2 extends Component {
    constructor(props) {
        super(props);

        this.state = {
            text: '',
            query: '',
        };

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

    _renderFooter = ({ item }) => (
        <View style={{ height: 20 }} />
    );

    _renderItem = ({ item, index }) => (
        <MyListItem
            data={item}
            index={index}
            changeCustom={this.props.changeCustom}
        />
    );

    render() {

        const animatedStyle = {
            transform: [{ scale: this.animatedValue }]
        }

        const search = COMPANIES.filter(x => x.name.toLowerCase().indexOf(this.state.query.toLowerCase()) > -1).sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase());

        return (
            <View style={{ marginTop: Dimensions.get('window').height * 0.17 }}>
            <View style={styles.container}>
                            <Image style={styles.search} source={{ uri: 'search' }} />
                            <TextInput
                                style={styles.subtext}
                                placeholder={'Search'}
                                placeholderTextColor={'rgba(74,74,74,0.5)'}
                                onChangeText={(query) => this.setState({ query })}
                                value={this.state.query}
                                enablesReturnKeyAutomatically={true}
                                returnKeyType={'done'}
                                blurOnSubmit={true}
                                numberOfLines={1}
                                spellCheck={false}
                                underlineColorAndroid={'transparent'} />
                        </View>
                <FlatList
                    data={search}
                    renderItem={this._renderItem}
                    scrollEnabled
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={this._renderFooter}
                    showsHorizontalScrollIndicator={false}
                    numColumns={2}
                    extraData={this.state}
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
        //alignContent: 'center',
        alignSelf: 'center',
        marginBottom: 10,
        marginHorizontal: 6,
        paddingLeft: 16,
        flexDirection: 'row',
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
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
        borderWidth: 0.25,
        borderColor: 'black',
        width: Dimensions.get('window').width * 0.43733,
        height: Dimensions.get('window').width * 0.43733 * 0.829268,
        marginVertical: 6,
        marginHorizontal: 6,
        backgroundColor: 'white',
        // shadowColor: 'black',
        // shadowOffset: { width: 0, height: 2 },
        // shadowOpacity: 0.25,
        // shadowRadius: 4,
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
    search: {
        height: 25,
        width: 25,
        tintColor: 'black',
        marginRight: 5
    },
    subtext: {
        color: '#4A4A4A',
        fontSize: Dimensions.get('window').width * 0.043,
        paddingTop: 1,
        flex: 1
    },
    linearGradient: {
        height: Dimensions.get('window').width * 0.43733 * 0.829268,
        paddingHorizontal: Dimensions.get('window').width * 0.43733 * 0.08,
        paddingBottom: Dimensions.get('window').width * 0.43733 * 0.08,
        justifyContent: 'flex-end',
    },
    cell: {
        width: Dimensions.get('window').width * 0.43733,
        height: Dimensions.get('window').width * 0.43733 * 0.829268,
        resizeMode: 'cover',
        justifyContent: 'flex-end'
    },
    trophy: {
        width: 20,
        height: 20,
        tintColor: '#FFD700'
    },
    aligner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignContent: 'center'
    }
});
