import React from 'react';
import Webiny from 'webiny';

/**
 * @i18n.namespace NotificationManager.Backend.Notification.PreviewModal
 */
class PreviewModal extends Webiny.Ui.ModalComponent {

    constructor(props) {
        super(props);
        this.state = {
            response: null
        };
        this.bindMethods('submit');
    }

    submit({model: preview}) {
        const api = new Webiny.Api.Endpoint('/entities/notification-manager/notifications');
        this.setState({loading: true});
        this.request = api.post(Webiny.Router.getParams('id') + '/preview', preview).then(apiResponse => {
            this.setState({response: apiResponse.getData(), loading: false}, () => {
                setTimeout(() => {
                    this.hide();
                }, 3000);
            });
        });
    }

    renderContent(model, form) {
        const {Alert, Tabs, plugins} = this.props;

        if (this.state.response) {
            return this.state.response.map((r, i) => {
                return (
                    <Alert key={i} type={r.status ? 'success' : 'danger'}>{r.message}</Alert>
                );
            });
        }

        let hasContent = false;
        const content = plugins.map((pl, index) => {
            const tab = pl(model, form, this.props.model);
            if (React.isValidElement(tab)) {
                hasContent = true;
            }
            return React.isValidElement(tab) ? React.cloneElement(tab, {key: index}) : null;
        });

        if (hasContent) {
            return (
                <Tabs position="left">
                    {content}
                </Tabs>
            );
        }

        return null;
    }

    renderDialog() {
        const {Modal, Form, Button, Loader, Alert} = this.props;

        return (
            <Modal.Dialog onHide={() => this.setState({response: null})}>
                <Form onSubmit={this.submit}>
                    {({model, form}) => {
                        const content = this.renderContent(model, form);
                        return (
                            <Modal.Content>
                                {this.state.loading ? <Loader/> : null}
                                <Modal.Header title={this.i18n('Preview Notification')}/>
                                <Modal.Body noPadding={!this.state.response}>
                                    {content || (
                                        <div>
                                            <Alert>{this.i18n('Currently there are no plugins available for preview.')}</Alert>
                                        </div>
                                    )}
                                </Modal.Body>
                                <Modal.Footer>
                                    <Button type="default" label={this.i18n('Close')} onClick={this.hide}/>
                                    <Button disabled={!content} type="primary" label={this.i18n('Send Preview')} onClick={form.submit}/>
                                </Modal.Footer>
                            </Modal.Content>
                        )
                    }}
                </Form>
            </Modal.Dialog>
        );
    }
}

export default Webiny.createComponent(PreviewModal, {
    modules: ['Alert', 'Tabs', 'Modal', 'Form', 'Button', 'Loader', {
        plugins: () => {
            return Webiny.importByTag('NotificationManager.NotificationForm.Preview').then(modules => {
                const promises = Object.values(modules).map(tab => tab());
                return Promise.all(promises);
            });
        }
    }]
});