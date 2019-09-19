import React, { Component } from 'react';
import {connect} from 'react-redux';
import PropTypes from "prop-types";
import { withNavigationFocus } from 'react-navigation';
import { StyleSheet } from 'react-native';
import { ActionSheet, Text } from 'native-base';
import { workers } from "../../actions";
import Avatar from "../../components/Avatar";
import { AddFab, MoreButton } from '../../components/Buttons';
import { Form, PressableItem } from '../../components/Form';
import { Content, Row, Screen } from '../../components/Screen';

const styles = StyleSheet.create({
    workerDescription: {
        flex: 1,
    },
});

const WorkerItems = ({ active, isStaff, onPress, workers}) => (
    workers.map(worker => (
        worker.is_active === active && (
            <PressableItem
                key={worker.id}
                onPress={() => onPress(worker)}
            >
                <Row justifyContent="space-between">
                    <Avatar
                        avatar_url={worker.avatar}
                        email={worker.email}
                        size={45}
                    />
                    <Text style={styles.workerDescription}>
                        {worker.first_name} {worker.last_name}
                        {isStaff && <Text> / {worker.company_name}</Text>}
                    </Text>
                    <Text>
                        {!worker.is_active && 'ARCHIVED'}
                    </Text>
                </Row>
            </PressableItem>
        )
    ))
);

class WorkersList extends Component {
    static navigationOptions = ({ navigation }) => ({
        headerRight: (
            <MoreButton onPress={navigation.getParam('showOptionsActionSheet')} />
        ),
    });

    state = {
        showingArchived: false,
    };

    componentDidMount() {
        this.props.navigation.setParams({
            showOptionsActionSheet: this.showOptionsActionSheet,
        });

        this.props.fetch();
    }

    componentDidUpdate(prevProps) {
        const { isFocused } = this.props;

        if (isFocused !== prevProps.isFocused && isFocused) {
            this.props.fetch();
        }
    }

    showOptionsActionSheet = () => {
        const { showingArchived } = this.state;

        const menuItems = [
            showingArchived ? 'Hide Archived' : 'Show Archived',
            'Cancel',
        ];

        const actionSheetOptions = {
            title: 'Options',
            options: menuItems,
            cancelButtonIndex: 1,
        };

        const handleUserChoice = index => {
            switch (menuItems[index]) {
                case 'Hide Archived':
                case 'Show Archived':
                    this.toggleShowArchived();
                    break;
            }
        }

        ActionSheet.show(actionSheetOptions, handleUserChoice);
    }

    showWorkerActionSheet = worker => {
        const { archiveWorker, navigation, reactivateWorker, currentUser } = this.props;

        const menuItems = [
            'View Timesheet',
            'Worker Profile',
        ]
        if(worker.id !== currentUser.id)
            menuItems.push(
                worker.is_active ? 'Archive' : 'Reactivate (impacts monthly billing)',
            );
        menuItems.push('Cancel')

        const actionSheetOptions = {
            title: worker.first_name + ' ' + worker.last_name,
            options: menuItems,
            destructiveButtonIndex: worker.is_active ? 2 : null,
            cancelButtonIndex: 3,
        };

        const handleUserChoice = index => {
            switch (menuItems[index]) {
                case 'View Timesheet':
                    navigation.navigate('WorkerTimeReport', {
                        title: 'Worker: ' + worker.first_name + ' ' + worker.last_name,
                        worker_id: worker.id,
                    });

                    break;
                case 'Worker Profile':
                    navigation.navigate('WorkerProfile', {
                        title: 'Worker Profile',
                        worker_id: worker.id,
                    });

                    break;
                case 'Archive':
                    archiveWorker(worker.id);
                    break;
                case 'Reactivate (impacts monthly billing)':
                    reactivateWorker(worker.id);
                    break;
            }
        }

        ActionSheet.show(actionSheetOptions, handleUserChoice);
    }

    toggleShowArchived = () => {
        this.setState(state => {
            return { showingArchived: !state.showingArchived }
        });
    }

    render() {
        const { isStaff, navigation, workers } = this.props;
        const { showingArchived } = this.state;

        if (!workers) {
            return null;
        }

        return (
            <Screen>
                <Content>
                    <Form>
                        <WorkerItems
                            active={true}
                            workers={workers.items}
                            isStaff={isStaff}
                            onPress={worker => this.showWorkerActionSheet(worker)}
                        />
                        {showingArchived &&
                            <WorkerItems
                                active={false}
                                workers={workers.items}
                                isStaff={isStaff}
                                onPress={worker => this.showWorkerActionSheet(worker)}
                            />
                        }
                    </Form>
                </Content>
                <AddFab onPress={() => navigation.navigate('PersonalInfo')} />
            </Screen>
        );
    }
}

WorkersList.propTypes = {
    navigation: PropTypes.shape({
        setParams: PropTypes.func.isRequired,
        navigate: PropTypes.func.isRequired,
    }).isRequired,
};

const mapStateToProps = state => {
    return {
        workers: state.workers,
        isStaff: state.auth.user.is_staff,
        currentUser: state.auth.user,
    }
};

const mapDispatchToProps = dispatch => {
    return {
        fetch: () => {
            dispatch(workers.fetchWorkers());
        },
        archiveWorker: (worker_id) => {
            return dispatch(workers.archiveWorker(worker_id));
        },
        reactivateWorker: (worker_id) => {
            return dispatch(workers.reactivateWorker(worker_id));
        },
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(withNavigationFocus(WorkersList));
