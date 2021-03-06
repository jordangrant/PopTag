import React, { Component } from 'react';
import {
    StyleSheet, View, Image, Dimensions, TouchableOpacity,
    Animated, AsyncStorage, Platform, FlatList, Text,
    TextInput, ImageBackground
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const ipad = (Dimensions.get('window').height > 1020);
const iphonex = (Platform.OS === 'ios' && Dimensions.get('window').height > 800 && Dimensions.get('window').height < 1020);

class MyListItem extends Component {
    constructor(props) {
        super(props);

        this.state = {
            following: '',
        };

    }

    render() {
        var company = this.props.data;
        var companysettings = this.props.data.description;
        companysettings = JSON.parse(companysettings);
        var type = companysettings[0];
        var challenge = companysettings[0].indexOf('challenges') > -1;
        var verified = companysettings[0].indexOf('verified') > -1;
        var location = companysettings[0].indexOf('location') > -1;
        var active = this.props.data.id == global.custom;

        return (
            <TouchableOpacity activeOpacity={0.8} onPress={() => this.props.changeCustom(company.id)}
                style={[active ? styles.activecontainer : styles.summarycontainerbottom, { backgroundColor: companysettings[1] }]}>
                <ImageBackground source={{ uri: company.image.url, cache: 'force-cache' }} style={styles.cell}>
                    <LinearGradient
                        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.1)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.5)']}
                        locations={[0, 0.5, 0.7, 1]}
                        style={styles.linearGradient}>
                        <View style={styles.aligner}>
                            <Text style={styles.summaryText} numberOfLines={1}>{company.name}</Text>
                            <Image style={verified ? styles.verified : 'null'} 
                            source={{ uri: verified ? 'verified' : 'null'}} />
                        </View>
                    </LinearGradient>

                </ImageBackground>
            </TouchableOpacity>
        );
    }
}

export default class Dialogue extends Component {
    constructor(props) {
        super(props);

        this.state = {
            text: '',
            query: '',
            paginator: 0.4
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

    expand() {
        if(this.state.paginator < 0.81){
            this.setState({ paginator: this.state.paginator + 0.2})
        }  
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

        var companies = this.props.groups;
        var search = companies.filter(x => x.name.toLowerCase().indexOf(this.state.query.toLowerCase()) > -1).sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase());
        if (global.filter == "questions" || global.filter == "challenges" || global.filter == "verified" || global.filter == "ab" || global.filter == "scavenger") {
            search = search.filter(x => JSON.parse(x.description)[0].indexOf(global.filter) > -1)
        }
        // else {
        //      search = search.slice(0, Math.floor(search.length*this.state.paginator))
        //  }

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

                {/* <View style={styles.buttonrow}>
                    <TouchableOpacity style={global.filter == 'questions' ? styles.buttonactive : styles.button} activeOpacity={1}
                        onPress={() => this.props.changeFilter('questions')}>
                        <Image style={styles.chatbubble} source={{ uri: 'chatbubble' }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={global.filter == 'challenges' ? styles.buttonactive : styles.button} activeOpacity={1}
                        onPress={() => this.props.changeFilter('challenges')}>
                        <Image style={styles.trophy} source={{ uri: 'trophy' }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={global.filter == 'ab' ? styles.buttonactive : styles.button} activeOpacity={1}
                        onPress={() => this.props.changeFilter('ab')}>
                        <Image style={styles.ab} source={{ uri: 'abog' }} />
                    </TouchableOpacity>

                    <TouchableOpacity style={global.filter == 'scavenger' ? styles.buttonactive : styles.button} activeOpacity={1}
                        onPress={() => this.props.changeFilter('scavenger')}>
                        <Image style={styles.scavenger} source={{ uri: 'scavenger' }} />
                    </TouchableOpacity>

                </View> */}

                <FlatList
                    data={search}
                    renderItem={this._renderItem}
                    scrollEnabled
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={this._renderFooter}
                    showsHorizontalScrollIndicator={false}
                    numColumns={2}
                    extraData={this.state}
                    //onEndReachedThreshold={1}
                    //onEndReached={this.expand.bind(this)}
                />
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        borderRadius: (ipad) ? 26 : 13,
        width: Dimensions.get('window').width * 0.904,
        height: Dimensions.get('window').width * 0.904 * 0.12684,
        maxHeight: 70,
        backgroundColor: 'white',
        alignItems: 'center',
        //alignContent: 'center',
        alignSelf: 'center',
        marginTop: (ipad) ? 15 : 0,
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
        flex: 1,
        color: 'white',
        fontWeight: '600',
        fontSize: ipad ? Dimensions.get('window').width * 0.035 : Dimensions.get('window').width * 0.042,
        backgroundColor: 'transparent'
    },
    summarycontainerbottom: {
        borderRadius: (ipad) ? 26 : 13,
        borderWidth: 0.25,
        borderColor: 'black',
        width: Dimensions.get('window').width * 0.43733,
        height: Dimensions.get('window').width * 0.43733 * 0.829268,
        marginVertical: 6,
        marginHorizontal: 6,
        backgroundColor: 'white',
        overflow: 'hidden'
    },
    activecontainer: {
        borderRadius: (ipad) ? 26 : 13,
        borderWidth: 3,
        borderColor: '#FFD700',
        width: Dimensions.get('window').width * 0.43733,
        height: Dimensions.get('window').width * 0.43733 * 0.829268,
        marginVertical: 6,
        marginHorizontal: 6,
        backgroundColor: 'white',
        overflow: 'hidden'
    },
    inputcontainer: {
        borderRadius: (ipad) ? 14 : 7,
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
        height: 14,
        width: 14,
        tintColor: 'black',
        marginRight: 10
    },
    subtext: {
        color: '#4A4A4A',
        fontSize: (ipad) ? 22 : Dimensions.get('window').width * 0.043,
        paddingTop: Platform.OS === 'android' ? 10 : 1,
        flex: 1
    },
    linearGradient: {
        height: Dimensions.get('window').width * 0.43733 * 0.829268,
        justifyContent: 'flex-end',
        width: Dimensions.get('window').width * 0.43733,
        paddingHorizontal: Dimensions.get('window').width * 0.43733 * 0.08,
        paddingBottom: Dimensions.get('window').width * 0.43733 * 0.08,
    },
    cell: {
        width: Dimensions.get('window').width * 0.43733,
        height: Dimensions.get('window').width * 0.43733 * 0.829268,
        resizeMode: 'cover',
        justifyContent: 'flex-end'
    },
    trophy: {
        width: (ipad) ? 40 : 20,
        height: (ipad) ? 40 : 20,
        tintColor: '#FFD700'
    },
    chatbubble: {
        width: (ipad) ? 40 : 20,
        height: (ipad) ? 40 : 20,
        tintColor: 'white'
    },
    ab: {
        width: (ipad) ? 49 : 26,
        height: (ipad) ? 49 : 26,
    },
    scavenger: {
        width: (ipad) ? 49 : 26,
        height: (ipad) ? 49 : 26,
        tintColor: 'white'
    },
    verified: {
        width: (ipad) ? 43.375 : 22.25,
        height: (ipad) ? 43 : 22,
    },
    aligner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignContent: 'center',
        overflow: 'hidden'
    },
    buttonrow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: Dimensions.get('window').width * 0.904,
        alignSelf: 'center',
        marginVertical: 5
    },
    button: {
        height: Dimensions.get('window').width * 0.904 * 0.12684,
        width: Dimensions.get('window').width * 0.904 * 0.12684 * 1.8,
        backgroundColor: 'rgba(0,0,0,0.54)',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: (ipad) ? 26 : 13,
    },
    buttonactive: {
        height: Dimensions.get('window').width * 0.904 * 0.12684,
        width: Dimensions.get('window').width * 0.904 * 0.12684 * 1.8,
        backgroundColor: 'rgba(0,0,0,0.54)',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: (ipad) ? 26 : 13,
        borderWidth: 3,
        borderColor: '#FFD700',
    }
});
