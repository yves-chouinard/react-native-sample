import React from 'react';
import PropTypes from 'prop-types';
import Moment from 'react-moment';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { Card, CardItem, Text } from 'native-base';
import AutoHeightImage from 'react-native-auto-height-image';
import Avatar from "./Avatar";
import { Row } from "./Screen";

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
    image: {
        margin: -2, // full width despite being in a card
    },
});

const NoteCard = ({ note }) => (
    <Card>
        <CardItem header>
            <Row>
                <Avatar avatar_url={note.user_avatar} email={note.user_email} />
                <View>
                    <Text>{note.user_first_name} {note.user_last_name}</Text>
                    <Moment format="dddd MMM D HH:mm:ss" element={Text}>
                        {note.date}
                    </Moment>
                </View>
            </Row>
        </CardItem>
        {note.description &&
            <CardItem>
                <Text>{note.description}</Text>
            </CardItem>
        }
        {note.images.map(file =>
            <AutoHeightImage
                key={file.image}
                source={{ uri: file.image }}
                style={styles.image}
                width={width}
            />
        )}
    </Card>
);

export const NotePropType = PropTypes.shape({
    date: PropTypes.string.isRequired,
    images: PropTypes.arrayOf(PropTypes.shape({
        image: PropTypes.string.isRequired,
    })),
    user_avatar: PropTypes.string,
    user_description: PropTypes.string,
    user_email: PropTypes.string,
    user_first_name: PropTypes.string,
    user_last_name: PropTypes.string,
});

NoteCard.propTypes = {
    note: NotePropType.isRequired,
};

export default NoteCard;