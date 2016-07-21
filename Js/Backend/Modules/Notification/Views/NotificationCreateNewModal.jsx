import Webiny from 'Webiny';
const Ui = Webiny.Ui.Components;

class NotificationCreateNewModal extends Webiny.Ui.ModalComponent {

    renderDialog() {
        const formProps = {
            ui: 'newNotificationForm',
            api: '/entities/notification-manager/notification',
            fields: 'id, title',
            onSubmitSuccess: (val) => {
                if (val.getData('id')) {
                    Webiny.Router.goToRoute('NotificationManager.Notification.Edit', {id: val.getData('id')});
                }
                this.hide();
            }
        };

        return (
            <Ui.Modal.Dialog>
                <Ui.Modal.Header title="New Notification"/>
                <Ui.Modal.Body>
                    <Ui.Form.Container {...formProps}>
                        {() => (
                            <Ui.Grid.Row>
                                <Ui.Grid.Col all={12}>
                                    <Ui.Input label="Title" name="title" validate="required"/>
                                </Ui.Grid.Col>
                                <Ui.Grid.Col all={12}>
                                    <Ui.Textarea label="Description" name="description"/>
                                </Ui.Grid.Col>
                            </Ui.Grid.Row>
                        )}
                    </Ui.Form.Container>
                </Ui.Modal.Body>
                <Ui.Modal.Footer>
                    <Ui.Button type="secondary" label="Cancel" onClick={this.hide}/>
                    <Ui.Button type="primary" label="Add Notification" onClick={this.ui('newNotificationForm:submit')}/>
                </Ui.Modal.Footer>
            </Ui.Modal.Dialog>
        );
    }
}

export default NotificationCreateNewModal;