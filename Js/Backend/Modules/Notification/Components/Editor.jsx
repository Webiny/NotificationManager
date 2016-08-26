import Webiny from 'Webiny';
const Ui = Webiny.Ui.Components;

class Editor extends Webiny.Ui.Component {
    constructor(props) {
        super(props);

        this.bindMethods(
            'detectVariable',
            'renderOption',
            'selectItem',
            'selectCurrent',
            'selectNext',
            'selectPrev',
            'getCurrentIndex'
        );

        this.state = {
            options: null,
            selectedOption: null
        };

        this.entityApi = new Webiny.Api.Endpoint('/services/core/entities');
        this.attributes = {};
    }

    componentDidMount() {
        super.componentDidMount();

        this.editor = this.refs.editor.getEditor();

        this.editor.on('text-change', (delta, oldDelta, source) => {
            if (source === 'user') {
                this.detectVariable();
            }
        });

        // 38 = UP, 40 = DOWN, 27 = ESCAPE, 13 = ENTER
        this.editor.keyboard.addBinding({key: 38}, () => {
            if (this.state.options) {
                this.selectPrev();
                return false;
            }
            return true;
        });

        this.editor.keyboard.addBinding({key: 40}, () => {
            if (this.state.options) {
                this.selectNext();
                return false;
            }
            return true;
        });

        this.editor.keyboard.addBinding({key: 27}, () => {
            if (this.state.options) {
                this.setState({options: null});
                return false;
            }
            return true;
        });

        // Need to use this hacky solution to execute my handler before all others
        this.editor.keyboard.bindings[13].unshift({
            key: 13, handler: () => {
                if (this.state.options && this.state.selectedOption !== null) {
                    this.selectCurrent();
                    return false;
                }
                return true;
            }
        });

        window.qe = this.editor;
    }

    setOptions(options) {
        if (!options || options.length === 0) {
            options = null;
        } else {
            options = _.sortBy(options, 'key');
        }

        this.setState({options, selectedOption: 0});
    }

    loadAttributes(entity) {
        if (this.attributes[entity]) {
            return Q(this.attributes[entity]);
        }

        return this.entityApi.get('attributes', {entity}).then(apiResponse => {
            const options = apiResponse.getData();
            _.map(options, o => {
                o.key = o.name;
            });
            this.attributes[entity] = options;
            return options;
        });
    }

    detectVariable() {
        const selection = this.editor.getSelection();
        const text = this.editor.getText(0, selection.index);
        let variable = null;

        if (text.endsWith('}')) {
            this.setOptions(null);
            return;
        }

        for (let i = selection.index - 1; i >= 0; i--) {
            if (typeof text[i] === 'undefined' || text[i] === ' ' || text[i] === '}') {
                break;
            }

            if (text[i] === '{' && text[i + 1] === '$') {
                variable = text.substring(i + 2, selection.index).trim();
                const vars = variable.split('.');
                if (vars.length <= 1) {
                    this.variableStartIndex = i + 2;
                    let options = _.clone(this.props.variables);
                    if (vars.length > 0) {
                        options = _.filter(options, o => o.key.startsWith(vars[0]));
                    }
                    return this.setOptions(options);
                }

                const root = vars.shift();
                const partial = vars.pop();
                const rootVar = _.find(this.props.variables, {key: root});

                if (rootVar) {
                    let chain = this.loadAttributes(rootVar.entity);
                    _.each(vars, v => {
                        chain = chain.then(options => {
                            const attr = _.find(options, {key: v});
                            if (attr && attr.entity) {
                                return this.loadAttributes(attr.entity);
                            }
                        });
                    });
                    chain = chain.then(options => {
                        this.variableStartIndex = (i + 2) + variable.lastIndexOf('.') + 1;
                        if (partial.length > 0) {
                            options = _.filter(options, o => o.key.startsWith(partial));
                        }
                        this.setOptions(options);
                    });
                }
                return;
            }
        }
    }

    getCurrentIndex() {
        const selection = this.editor.getSelection(true);
        return selection.index;
    }

    renderOption(item, index) {
        const itemClasses = {
            'variable-option': true,
            'text-left': true,
            selected: index === this.state.selectedOption
        };

        const linkProps = {
            onMouseDown: this.selectCurrent,
            onMouseOver: () => this.setState({selectedOption: index})
        };

        const type = <span className="type">{_.has(item, 'entity') ? item.entity : item.type}</span>;

        return (
            <li key={index} className={this.classSet(itemClasses)} {...linkProps}>
                <span className="title"><Ui.Icon icon={_.has(item, 'entity') ? 'fa-database' : 'fa-cube'}/> {item.key}</span>
                {item.description ? <span className="description">{item.description}</span> : null}<br/>
                {type}
            </li>
        );
    }

    selectItem(item) {
        if (!item || !this.variableStartIndex) {
            return;
        }
        let insert = item.key;
        if (_.has(item, 'entity')) {
            insert += '.';
        } else {
            insert += '}';
        }
        this.editor.deleteText(this.variableStartIndex, this.editor.getSelection().index - this.variableStartIndex);
        this.editor.insertText(this.variableStartIndex, insert);
        this.editor.setSelection(this.variableStartIndex + _.get(insert, 'length', 0));
        this.variableStartIndex = null;
        setTimeout(() => {
            this.setState({options: null, selectedOption: null}, this.detectVariable);
        }, 20);
    }

    selectNext() {
        if (!this.state.options) {
            return;
        }

        let selected = this.state.selectedOption + 1;
        if (selected >= this.state.options.length) {
            selected = this.state.options.length - 1;
        }

        this.setState({
            selectedOption: selected
        });
    }

    selectPrev() {
        if (!this.state.options) {
            return;
        }

        let selected = this.state.options.length - 1;
        if (this.state.selectedOption <= selected) {
            selected = this.state.selectedOption - 1;
        }

        if (selected < 0) {
            selected = 0;
        }

        this.setState({
            selectedOption: selected
        });
    }

    selectCurrent() {
        if (!this.state.options) {
            return;
        }

        if (this.state.selectedOption === -1) {
            return;
        }

        const current = this.state.options[this.state.selectedOption];
        this.selectItem(current);
    }
}

Editor.defaultProps = {
    imageApi: '/entities/core/images',
    accept: ['image/jpg', 'image/jpeg', 'image/gif', 'image/png'],
    sizeLimit: 2485760,
    label: null,
    description: null,
    info: null,
    tooltip: null,
    toolbar: [
        ['bold', 'italic', 'underline', 'strike'],
        ['link'],
        [{'list': 'ordered'}, {'list': 'bullet'}],
        [{'indent': '-1'}, {'indent': '+1'}],
        [{'size': ['small', false, 'large', 'huge']}],
        [{'header': [1, 2, 3, 4, 5, 6, false]}],
        [{'color': []}, {'background': []}],
        [{'font': []}],
        [{'align': []}],
        ['clean']
    ],
    renderer() {
        let label = null;
        if (this.props.label) {
            let tooltip = null;
            if (this.props.tooltip) {
                tooltip = <Ui.Tooltip target={<Ui.Icon icon="icon-info-circle"/>}>{this.props.tooltip}</Ui.Tooltip>;
            }
            label = <label className="control-label">{this.props.label} {tooltip}</label>;
        }

        let info = this.props.info;
        if (_.isFunction(info)) {
            info = info(this);
        }

        let description = this.props.description;
        if (_.isFunction(description)) {
            description = description(this);
        }

        let dropdownMenu = null;
        const selection = this.editor && this.editor.getSelection(true);
        if (this.state.options && selection) {
            const bounds = this.editor.getBounds(selection.index);
            const toolbarHeight = this.editor.getModule('toolbar').container.offsetHeight + 15;
            dropdownMenu = (
                <div className="search" style={{top: bounds.top + toolbarHeight, left: bounds.left}}>
                    <div className="autosuggest">
                        <div className="plain-search">
                            <ul>{this.state.options.map(this.renderOption)}</ul>
                        </div>
                    </div>
                </div>
            );
        }

        const passProps = ['accept', 'imageApi', 'sizeLimit', 'toolbar', 'valueLink'];

        return (
            <div className="form-group">
                {label}
                <span className="info-text">{info}</span>

                <div className="notification-manager-editor">
                    <Ui.HtmlEditor ref="editor" {..._.pick(this.props, passProps)}/>
                    {dropdownMenu}
                </div>
                <span className="help-block">{description}</span>
            </div>
        );
    }
};

export default Editor;