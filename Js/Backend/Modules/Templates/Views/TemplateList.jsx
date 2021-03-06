import React from 'react';
import Webiny from 'webiny';

/**
 * @i18n.namespace NotificationManager.Backend.Templates.TemplateList
 */
class TemplateList extends Webiny.Ui.View {
    constructor(props) {
        super(props);
    }
}

TemplateList.defaultProps = {

    renderer() {
        const listProps = {
            api: '/entities/notification-manager/templates',
            fields: 'name,createdOn',
            searchFields: 'name',
            connectToRouter: true
        };

        const searchProps = {
            placeholder: this.i18n('Search by name'),
            name: '_searchQuery'
        };

        const {View, Grid, Link, Icon, List, Input, Button} = this.props;

        return (
            <View.List>
                <View.Header title={this.i18n('Templates')}>
                    <Link type="primary" align="right" route="NotificationManager.Template.Create">
                        <Icon icon="icon-plus-circled"/>
                        {this.i18n('Create new Template')}
                    </Link>
                </View.Header>
                <View.Body>
                    <List {...listProps}>
                        <List.FormFilters>
                            {({apply, reset}) => (
                                <Grid.Row>
                                    <Grid.Col all={10}>
                                        <Input {...searchProps} onEnter={apply()}/>
                                    </Grid.Col>
                                    <Grid.Col all={2}>
                                        <Button type="secondary" align="right" label={this.i18n('Reset Filter')} onClick={reset()}/>
                                    </Grid.Col>
                                </Grid.Row>
                            )}
                        </List.FormFilters>
                        <List.Table>
                            <List.Table.Row>
                                <List.Table.Field
                                    name="name"
                                    align="left"
                                    label={this.i18n('Name')}
                                    sort="name"
                                    route="NotificationManager.Template.Edit"/>
                                <List.Table.TimeAgoField name="createdOn" align="left" label={this.i18n('Created')} sort="createdOn"/>
                                <List.Table.Actions>
                                    <List.Table.EditAction route="NotificationManager.Template.Edit"/>
                                    <List.Table.DeleteAction/>
                                </List.Table.Actions>
                            </List.Table.Row>
                        </List.Table>
                        <List.Pagination/>
                    </List>
                </View.Body>
            </View.List>
        );
    }
};

export default Webiny.createComponent(TemplateList, {modules: ['View', 'Grid', 'Link', 'Icon', 'List', 'Input', 'Button']});