import { htmlToElement } from '@modules/utils';
import template from './JobFormComponent.handlebars';
import './style.css';
import Component from '@frame/Component';
import { Select } from '@components/Inputs/Select/Select';
import { enableValidationAndSubmit } from '@modules/form/formValidationAndSubmit';
import Frame from '@frame/frame';
import bus from '@frame/bus';
import TextField from '@components/Inputs/TextField/TextField';
import DoubleSelect from '@components/Inputs/DoubleSelect/DoubleSelect';

const modes = {
	project: 'project',
	vacancy: 'vacancy',
};

class JobFormComponent extends Component {
	constructor({ ...props }) {
		super(props);
		this.data = {
			props,
			isProject: () => props.mode === modes.project,
			isVacancy: () => props.mode === modes.vacancy,
			jobTypeId: props.mode === modes.vacancy ? 1 : 0,
		};

		this.onCreateJobResponse = this.onCreateJobResponse.bind(this);

		let title = '';
		switch (this.props.mode) {
		case modes.project:
			title = 'Новый проект';
			break;
		case modes.vacancy:
			title = 'Новая вакансия';
			break;
		default:
			break;
		}
		this.data = { title, ...this.data };

		this.helper = null;
	}

	render() {
		const items = [
			{ label: 'text1', value: 'text1', selected: false },
			{ label: 'text2', value: 'text2', selected: true },
		];
		const component = Frame.createComponent(Select, this._el, {
			id: 'mySelect',
			items,
			onChange(value) {
				console.log(value);
			},
		});
		const textField = new TextField({
			required: true,
			type: 'text',
			label: 'Название',
			placeholder: '',
			hint: `<div> Напишите название вашего проекта. Название должно привлечь внимание и отразить суть проекта. </div> 
				<div> Несколько хороших примеров: 
				<ul>
				<li> Нужен разрабтчик для создания адаптивной темы для WordPress </li> 
				<li>Нужен дизайн нового логотипа компании</li> 
				<li>Ищем специалиста по по 3D моделированию</li> 
				</ul>
				</div>`,
		});
		const descriptionField = new TextField({
			required: true,
			type: 'textarea',
			label: 'Описание проекта',
			placeholder: '',
			hint: `<ul> <li> Укажите каким должен быть результат работы; требование к результату </li> <li> Каким должен быть фрилансер; требование к исполнителю </li> <li>Важная информация о проекте</li> <li>Сроки выполнения и другие условия</li> </ul>`,
		});
		const budgetField = new TextField({
			required: true,
			type: 'number',
			label: 'Бюджет',
			placeholder: '',
		});

		this._citySelect = new DoubleSelect({ items });
		this._specialitySelect = new DoubleSelect({ items });

		this.data = {
			mySelect: component.render(),
			textField: textField.render(),
			descriptionField: descriptionField.render(),
			budgetField: budgetField.render(),
			citySelect: this._citySelect.render(),
			specialitySelect: this._specialitySelect.render(),
			...this.data,
		};
		this.html = template(this.data);
		// this._el = htmlToElement(html);
		//
		// const mySelect = this._el.querySelector('#mySelect');
		// if (mySelect) {
		// 	component.postRender(mySelect);
		// }
		//
		// this._parent.appendChild(this._el);
		this.attachToParent();

		return this.html;
	}

	preRender() {}

	postRender() {
		this._citySelect.postRender();
		this._specialitySelect.postRender();

		// const form = this._el.querySelector('#projectForm');
		const form = this.el.querySelector('#projectForm');
		if (form) {
			enableValidationAndSubmit(form, (helper) => {
				helper.event.preventDefault();

				this.helper = helper;

				bus.on('job-create-response', this.onCreateJobResponse);
				bus.emit('job-create', helper.formToJSON());
			});
		}
	}

	onCreateJobResponse(data) {
		bus.off('job-create-response', this.onCreateJobResponse);
		console.log('data', Math.random(), bus.listeners);
		const { error, response } = data;
		if (error) {
			let text = error.message;
			if (error.data && error.data.error) {
				text = error.data.error;
			}
			this.helper.setResponseText(text);
			return;
		}

		this.props.router.push(`/jobs/${response.id}`);
	}
}

export default JobFormComponent;
