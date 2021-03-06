import React from 'react';
import Webiny from 'webiny';
import NotificationCreateNewModal from './NotificationCreateNewModal';

/**
 * @i18n.namespace NotificationManager.Backend.Notification.PreviewModal
 */
class NotificationList extends Webiny.Ui.View {
    constructor(props) {
        super(props);
    }
}

NotificationList.defaultProps = {

    renderer() {
        const listProps = {
            api: '/entities/notification-manager/notifications',
            fields: 'title,description,slug,email.subject,createdOn,labels',
            searchFields: 'title,slug,description,email.subject,labels',
            sort: '-id',
            connectToRouter: true
        };

        const searchProps = {
            placeholder: 'Search by title, description or email subject',
            name: '_searchQuery'
        };

        return (
            <Webiny.Ui.LazyLoad modules={['View', 'Button', 'Icon', 'List', 'Grid', 'Input', 'Dropdown', 'Label']}>
                {(Ui) => (
                    <Ui.View.List>
                        <Ui.View.Header title={this.i18n('Notifications')}>
                            <Ui.Button type="primary" align="right" onClick={() => this.notificationCreateNewModal.show()}>
                                <Ui.Icon icon="icon-plus-circled"/>
                                {this.i18n('Create notification')}
                            </Ui.Button>
                            <NotificationCreateNewModal ref={ref => this.notificationCreateNewModal = ref}/>
                        </Ui.View.Header>
                        <Ui.View.Body>
                            <Ui.List {...listProps}>
                                <Ui.List.FormFilters>
                                    {({apply, reset}) => (
                                        <Ui.Grid.Row>
                                            <Ui.Grid.Col all={10}>
                                                <Ui.Input {...searchProps} onEnter={apply()}/>
                                            </Ui.Grid.Col>
                                            <Ui.Grid.Col all={2}>
                                                <Ui.Button type="secondary" align="right" label={this.i18n('Reset Filter')} onClick={reset()}/>
                                            </Ui.Grid.Col>
                                        </Ui.Grid.Row>
                                    )}
                                </Ui.List.FormFilters>
                                <Ui.List.Table>
                                    <Ui.List.Table.Row>
                                        <Ui.List.Table.Field
                                            align="left"
                                            label={this.i18n('Title')}
                                            sort="title"
                                            route="NotificationManager.Notification.Edit">
                                            {({data}) => (
                                                <span>
                                                    <strong>{data.title}</strong>
                                                    <br/>{data.slug}<br/>
                                                    {data.labels.map((l, k) => <Ui.Label key={k} type="info">{l}</Ui.Label>)}
                                                </span>
                                            )}
                                        </Ui.List.Table.Field>
                                        <Ui.List.Table.Field name="description" align="left" label={this.i18n('Description')} sort="description"/>
                                        <Ui.List.Table.TimeAgoField name="createdOn" align="left" label={this.i18n('Created')} sort="createdOn"/>
                                        <Ui.List.Table.Actions>
                                            <Ui.List.Table.Action
                                                label={this.i18n('Copy')}
                                                icon="fa-files-o"
                                                onClick={({data, actions}) => {
                                                    actions.api.post(`${data.id}/copy`).then(response => {
                                                        Webiny.Growl.success('Notification copied successfully!');
                                                        Webiny.Router.goToRoute('NotificationManager.Notification.Edit', {
                                                            id: response.getData('entity').id
                                                        });
                                                    });
                                                }}/>
                                            <Ui.Dropdown.Divider />
                                            <Ui.List.Table.EditAction route="NotificationManager.Notification.Edit"/>
                                            <Ui.List.Table.DeleteAction/>
                                        </Ui.List.Table.Actions>
                                    </Ui.List.Table.Row>
                                </Ui.List.Table>
                                <Ui.List.Pagination/>
                            </Ui.List>
                        </Ui.View.Body>
                    </Ui.View.List>
                )}
            </Webiny.Ui.LazyLoad>
        );
    }
};

export default NotificationList;