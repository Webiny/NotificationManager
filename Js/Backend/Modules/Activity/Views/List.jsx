import Webiny from 'Webiny';
const Ui = Webiny.Ui.Components;
const Table = Ui.List.Table;

class List extends Webiny.Ui.View {
    constructor(props) {
        super(props);

        this.bindMethods('showContent');
    }

    showContent(id) {
        const myWindow = window.open('', '_blank', 'width=800,height=600');
        const api = new Webiny.Api.Endpoint('/entities/notification-manager/email-log').setQuery({'_fields': 'content'});

        api.get('/' + id).then((response) => {
            // tell to the feedback service not to mark email as read on the preview
            response.data.data.content = response.data.data.content.replace(/\/1px/, '/1px?preview=true');

            // show the preview window
            myWindow.document.write(response.data.data.content);
            myWindow.focus();
        });
    }
}

List.defaultProps = {

    renderer() {
        const listProps = {
            api: '/entities/notification-manager/email-log',
            fields: 'id,status,email,name,subject,createdOn',
            searchFields: 'email,name,subject',
            connectToRouter: true
        };

        const searchProps = {
            placeholder: 'Search by name, email or subject',
            name: '_searchQuery'
        };

        const dateProps = {
            placeholder: 'Search by date',
            name: 'createdOn'
        };

        return (
            <Ui.View.List>
                <Ui.View.Header title="Activity"/>
                <Ui.View.Body>
                    <Ui.List.ApiContainer ui="templateList" {...listProps}>

                        <Ui.List.FormFilters>
                            {(applyFilters, resetFilters) => (
                                <Ui.Grid.Row>
                                    <Ui.Grid.Col all={5}>
                                        <Ui.Input {...searchProps} onEnter={applyFilters()}/>
                                    </Ui.Grid.Col>
                                    <Ui.Grid.Col all={5}>
                                        <Ui.Date {...dateProps} onEnter={applyFilters()}/>
                                    </Ui.Grid.Col>
                                    <Ui.Grid.Col all={2}>
                                        <Ui.Button type="secondary" align="right" label="Reset Filters" onClick={resetFilters()}/>
                                    </Ui.Grid.Col>
                                </Ui.Grid.Row>
                            )}
                        </Ui.List.FormFilters>

                        <Table.Table>
                            <Table.Row>
                                <Table.CaseField name="status" label="Status" align="left">
                                    <case value={0}>
                                        <Ui.Label type="default">Pending</Ui.Label>
                                    </case>
                                    <case value={1}>
                                        <Ui.Label type="error">Error</Ui.Label>
                                    </case>
                                    <case value={2}>
                                        <Ui.Label type="info">Sent</Ui.Label>
                                    </case>
                                    <case value={3}>
                                        <Ui.Label type="success">Delivered</Ui.Label>
                                    </case>
                                    <case value={4}>
                                        <Ui.Label type="error">Hard Bounce</Ui.Label>
                                    </case>
                                    <case value={5}>
                                        <Ui.Label type="warning">Soft Bounce</Ui.Label>
                                    </case>
                                    <case value={6}>
                                        <Ui.Label type="error">Complaint</Ui.Label>
                                    </case>
                                    <case value={7}>
                                        <Ui.Label type="success">Read</Ui.Label>
                                    </case>
                                </Table.CaseField>
                                <Table.TimeAgoField name="createdOn" align="left" label="Date Sent" sort="createdOn"/>
                                <Table.Field name="email" align="left" label="Email" sort="email"/>
                                <Table.Field name="subject" align="left" label="Subject" sort="subject"/>
                                <Table.Field align="right">
                                    {data => <Ui.Button type="default" label="Show Content" onClick={() => this.showContent(data.id)}/>}
                                </Table.Field>

                            </Table.Row>
                        </Table.Table>

                        <Ui.List.Pagination/>
                    </Ui.List.ApiContainer>

                </Ui.View.Body>
            </Ui.View.List>
        );
    }
};

export default List;