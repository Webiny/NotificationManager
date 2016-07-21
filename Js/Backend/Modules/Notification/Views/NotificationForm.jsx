import Webiny from 'Webiny';
import VariableList from './NotificationForm/VariableList';
import PreviewModal from './NotificationForm/PreviewModal';
import SendingHistory from './NotificationForm/SendingHistory';
const Ui = Webiny.Ui.Components;


class NotificationForm extends Webiny.Ui.View {

    constructor(props) {
        super(props);

        this.bindMethods('sendTestEmail');
    }

    sendTestEmail(emailContent) {
        const postBody = {
            'email': Webiny.Model.get('User').email,
            'content': emailContent
        };

        const api = new Webiny.Api.Endpoint('/entities/notification-manager/notifications');

        // show modal box
        this.ui('previewModal').show();
        api.post('preview/' + Webiny.Router.getParams('id'), postBody).then(() => {
            // update status in the modalbox
            this.ui('previewModal').setSuccess();
        });
    }

}

NotificationForm.defaultProps = {
    renderer() {
        const formProps = {
            api: '/entities/notification-manager/notifications',
            fields: '*,template',
            connectToRouter: true,
            onSubmitSuccess: () => Webiny.Router.goToRoute('NotificationManager.Notifications'),
            onCancel: () => Webiny.Router.goToRoute('NotificationManager.Notifications')
        };

        const templateSelect = {
            ui: 'templateSelect',
            api: '/entities/notification-manager/templates',
            fields: 'name',
            label: 'Template',
            name: 'template',
            placeholder: 'Select template',
            allowClear: true
        };

        return (
            <Ui.Form.Container ui="notificationForm" {...formProps}>
                {(model, container) => (
                    <Ui.View.Form>
                        <Ui.View.Header title="Notification"/>

                        <Ui.View.Body noPadding={true}>
                            <Ui.Tabs.Tabs>
                                <Ui.Tabs.Tab label="General" icon="icon-settings">
                                    <Ui.Grid.Row>
                                        <Ui.Grid.Col all={6}>
                                            <Ui.Form.Fieldset title="Notification Settings"/>

                                            <Ui.Input label="Title" name="title" validate="required"/>
                                            <Ui.Input label="Slug" name="slug" readOnly={true}/>
                                            <Ui.Textarea label="Description" name="description"/>
                                            <Ui.Tags label="Labels" name="labels" placeholder="Add Label"/>
                                        </Ui.Grid.Col>
                                        <Ui.Grid.Col all={6}>
                                            <Ui.Form.Fieldset title="Sending History"/>
                                            <SendingHistory/>
                                        </Ui.Grid.Col>
                                    </Ui.Grid.Row>
                                </Ui.Tabs.Tab>
                                <Ui.Tabs.Tab label="Email content" icon="icon-doc-text">
                                    <Ui.Grid.Row>
                                        <Ui.Grid.Col all={6}>
                                            <Ui.Input label="Subject" name="email.subject" validate="required"/>
                                            <Ui.Input label="From Address" name="email.fromAddress" validate="required, email"/>
                                            <Ui.Input label="From Name" name="email.fromName" validate="required"/>
                                            <Ui.Select {...templateSelect} validate="required"/>
                                        </Ui.Grid.Col>
                                        <Ui.Grid.Col all={6}>
                                            <Ui.HtmlEditor label="Content" name="email.content"/>
                                        </Ui.Grid.Col>
                                    </Ui.Grid.Row>
                                </Ui.Tabs.Tab>
                                <Ui.Tabs.Tab label="Variables" icon="icon-menu">
                                    <VariableList/>
                                </Ui.Tabs.Tab>
                            </Ui.Tabs.Tabs>
                        </Ui.View.Body>
                        <Ui.View.Footer align="right">
                            <Ui.Button type="primary" onClick={container.submit}>Save Changes</Ui.Button>
                            <Ui.Button type="secondary" onClick={() => this.sendTestEmail(model.email.content)}>Send Test Email</Ui.Button>
                            <Ui.Button type="default" onClick={container.cancel}>Go Back</Ui.Button>
                        </Ui.View.Footer>

                        <PreviewModal ui="previewModal"/>
                    </Ui.View.Form>
                )}
            </Ui.Form.Container>
        );
    }
};


export default NotificationForm;
