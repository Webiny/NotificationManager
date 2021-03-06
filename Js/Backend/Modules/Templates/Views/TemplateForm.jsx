import React from 'react';
import Webiny from 'webiny';

/**
 * @i18n.namespace NotificationManager.Backend.Templates.TemplateForm
 */
class TemplateForm extends Webiny.Ui.View {

    constructor(props) {
        super(props);

        this.bindMethods('previewTemplate');
    }

    previewTemplate(content) {
        const newWindow = window.open("about:blank", "_blank", 'width=800,height=600');
        newWindow.document.write(content);
    }

}

TemplateForm.defaultProps = {
    renderer() {
        const formProps = {
            api: '/entities/notification-manager/templates',
            fields: '*',
            connectToRouter: true,
            onSubmitSuccess: () => Webiny.Router.goToRoute('NotificationManager.Templates'),
            onCancel: () => Webiny.Router.goToRoute('NotificationManager.Templates')
        };

        const {Ui} = this.props;

        return (
            <Ui.Form {...formProps}>
                {({model, form}) => (
                    <Ui.View.Form>
                        <Ui.View.Header title={this.i18n('Template')}/>
                        <Ui.View.Body>
                            <Ui.Grid.Row>
                                <Ui.Grid.Col all={8}>
                                    <Ui.Section title={this.i18n('Template')}/>
                                    <Ui.Input label={this.i18n('Name')} name="name" validate="required"/>
                                    <Ui.CodeEditor
                                        label={this.i18n('Content')}
                                        name="content"
                                        description={this.i18n('Enter plain text or HTML content')}/>
                                </Ui.Grid.Col>
                                <Ui.Grid.Col all={4}>
                                    <Ui.Section title={this.i18n('System Tags')}/>
                                    <dl>
                                        <dt>&#123;_hostName_&#125;</dt>
                                        <dd>
                                            {this.i18n('Website address, {origin}', <strong>{window.location.origin}</strong>)}
                                        </dd>
                                    </dl>
                                    <dl>
                                        <dt>&#123;_content_&#125;</dt>
                                        <dd>{this.i18n('Variable containing notification content.')}</dd>
                                    </dl>
                                    <dl>
                                        <dt>&#123;_subject_&#125;</dt>
                                        <dd>{this.i18n('Variable containing notification subject.')}</dd>
                                    </dl>
                                    <dl>
                                        <dt>{this.i18n('Notification variables')}</dt>
                                        <dd>{this.i18n(`Additionally you can include any of the variables that are available inside your
                                            notification, that will be using this template.`)}
                                        </dd>
                                    </dl>
                                </Ui.Grid.Col>
                            </Ui.Grid.Row>
                        </Ui.View.Body>
                        <Ui.View.Footer>
                            <Ui.Button align="right" type="primary" onClick={form.submit}>{this.i18n('Save Changes')}</Ui.Button>
                            <Ui.Button align="right" type="secondary" onClick={() => this.previewTemplate(model.content)}>
                                {this.i18n('Preview Template')}
                            </Ui.Button>
                            <Ui.Button align="left" type="default" onClick={form.cancel}>{this.i18n('Go Back')}</Ui.Button>
                        </Ui.View.Footer>
                    </Ui.View.Form>
                )}
            </Ui.Form>
        );
    }
};


export default Webiny.createComponent(TemplateForm, {
    modulesProp: 'Ui',
    modules: ['Form', 'View', 'Grid', 'Section', 'Input', 'CodeEditor', 'Button']
});
