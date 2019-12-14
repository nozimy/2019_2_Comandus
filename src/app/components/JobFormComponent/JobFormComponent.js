import template from './JobFormComponent.handlebars';
import './style.scss';
import Component from '@frame/Component';
import { enableValidationAndSubmit } from '@modules/form/formValidationAndSubmit';
import bus from '@frame/bus';
import TextField from '@components/inputs/TextField/TextField';
import DoubleSelect from '@components/inputs/DoubleSelect/DoubleSelect';
import RadioGroup from '@components/inputs/RadioGroup/RadioGroup';
import InputTags from '@components/inputs/InputTags/InputTags';
import FieldGroup from '@components/inputs/FieldGroup/FieldGroup';
import Button from '@components/inputs/Button/Button';
import {
	categories,
	specialities,
	levelsRadio,
	jobTypes,
	busEvents,
	levels,
	specialitiesRow,
} from '@app/constants';
import store from '@modules/store';
import UtilService from '@services/UtilService';

const jobInit = {
	city: '',
	country: '',
	description: '',
	experienceLevelId: '',
	jobTypeId: '',
	paymentAmount: '',
	specialityId: '',
	status: '',
	title: '',
};

class JobFormComponent extends Component {
	constructor({ ...props }) {
		super(props);
		this.data = {
			props,
		};

		this.helper = null;
		console.log('constructor');

		this.jobUpdated = this.jobUpdated.bind(this);
		this.preRender = this.preRender.bind(this);
		this.render = this.render.bind(this);
		this.postRender = this.postRender.bind(this);
		this.stateChanged = this.stateChanged.bind(this);
		this.attachToParent = this.attachToParent.bind(this);
	}

	preRender() {
		let title = 'Новая работа';

		this.data = {
			title,
			...this.data,
			isEdit: this.props.params && this.props.params.jobId ? true : false,
			jobId: this.props.params && this.props.params.jobId,
		};

		this.data = {
			job: {},
		};

		console.log('this.props.params.jobId', this.props.params.jobId);

		if (this.props.params.jobId) {
			bus.on(busEvents.JOB_UPDATED, this.jobUpdated);
			bus.emit(busEvents.JOB_GET, this.props.params.jobId);
		}

		bus.on(busEvents.UTILS_LOADED, this.utilsLoaded);
		this.data = {
			countryList: UtilService.MapCountriesToSelectList(),
		};

		console.log('prerender job', this.data.job);
		console.log('prerender data', this.data);
		console.log('prerender');
	}

	render() {
		let job = { ...jobInit, ...this.data.job };

		console.log('render this.data.job', this.data.job);
		console.log('render this.data', this.data);

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
			name: 'title',
			value: job.title,
		});
		const descriptionField = new TextField({
			required: true,
			type: 'textarea',
			label: 'Описание проекта',
			placeholder: '',
			hint: `<ul> <li> Укажите каким должен быть результат работы; требование к результату </li> <li> Каким должен быть фрилансер; требование к исполнителю </li> <li>Важная информация о проекте</li> <li>Сроки выполнения и другие условия</li> </ul>`,
			name: 'description',
			value: job.description,
		});
		const budgetField = new TextField({
			required: true,
			type: 'number',
			label: 'Бюджет',
			placeholder: '',
			name: 'paymentAmount',
			pattern: 'd{1,7}',
			min: 1,
			max: 1000000,
			value: job.paymentAmount,
		});

		this._citySelect = new DoubleSelect({
			items: this.data.countryList,
			label1: 'Страна',
			items2: {},
			label2: 'Город',
			name: 'city',
			nameFirst: 'country',
			label: 'Нужен исполнитель из...',
			required: true,
			filterable: true,
			selectedItem1: job.country,
			selectedItem2: job.city,
			getItems2: UtilService.getCityListByCountry,
		});

		this._specialitySelect = new DoubleSelect({
			items: categories,
			label1: 'Категория',
			items2: specialities,
			label2: 'Специализация',
			name: 'specialityId',
			label: 'Специализация проекта',
			required: true,
			filterable: true,
			selectedItem1: '',
			selectedItem2: job.specialityId,
			getItems2: UtilService.getSpecialitiesByCategory,
		});

		this._levelRadioGroup = new RadioGroup({
			items: levelsRadio,
			column: true,
			required: true,
			name: 'experienceLevelId',
			value: job.experienceLevelId,
		});

		this._inputTags = new InputTags({
			name: 'skills',
			max: 5,
			duplicate: false,
			tags: [],
			value: job.skills,
		});

		const submitBtn = new Button({
			type: 'submit',
			text: this.props.params.jobId
				? 'Сохранить изменения'
				: 'Опубликовать',
		});

		this._jobTypeRadio = new RadioGroup({
			items: jobTypes,
			required: true,
			name: 'jobTypeId',
			onClick: (value) => {
				console.log(value);
			},
			value: job.jobTypeId,
		});

		this.data = {
			textField: new FieldGroup({
				children: [textField.render()],
				label: 'Название',
			}).render(),

			descriptionField: new FieldGroup({
				children: [descriptionField.render()],
				label: 'Описание проекта',
			}).render(),

			budgetField: new FieldGroup({
				children: [budgetField.render()],
				label: 'Бюджет (руб)',
				two: true,
			}).render(),

			citySelect: this._citySelect.render(),

			specialitySelect: this._specialitySelect.render(),

			levelRadioGroup: new FieldGroup({
				children: [
					'<div> Выберите требуемый уровень фрилансера для выполнения вашего проекта. </div>',
					this._levelRadioGroup.render(),
				],
				label: 'Уровень фрилансера',
			}).render(),

			inputTags: new FieldGroup({
				children: [
					'<div>Какие навыки и опыт более важны для вас?</div>',
					this._inputTags.render(),
				],
				label: 'Требуемые навыки и компетенции',
			}).render(),

			submitBtn: new FieldGroup({
				children: [submitBtn.render()],
			}).render(),

			_jobTypeRadio: new FieldGroup({
				children: [this._jobTypeRadio.render()],
				label: 'Тип работы',
			}).render(),
		};

		this.html = template(this.data);

		this.attachToParent();

		console.log('render');

		return this.html;
	}

	postRender() {
		// if (this.data.isVacancy()) {
		this._citySelect.postRender();
		// }
		this._specialitySelect.postRender();
		this._inputTags.postRender();
		this._jobTypeRadio.postRender();

		const form = this.el.querySelector('#projectForm');
		if (form) {
			enableValidationAndSubmit(form, (helper) => {
				helper.event.preventDefault();

				this.helper = helper;
				const data = helper.formToJSON();
				data.city = parseInt(data.city);
				data.country = parseInt(data.country);

				if (this.data.isEdit) {
					bus.on(busEvents.JOB_PUT_RESPONSE, this.onJobEditResponse);
					bus.emit(busEvents.JOB_PUT, {
						jobId: this.data.jobId,
						data: data,
					});
				} else {
					bus.on('job-create-response', this.onCreateJobResponse);
					bus.emit('job-create', data);
				}
			});
		}

		console.log('postrender job', this.data.job);
		console.log('postrender data', this.data);
		console.log('postrender');
	}

	onCreateJobResponse = (data) => {
		bus.off('job-create-response', this.onCreateJobResponse);
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
	};

	onJobEditResponse = (data) => {
		bus.off(busEvents.JOB_PUT_RESPONSE, this.onJobEditResponse);

		const { error, response } = data;
		if (error) {
			let text = error.message;
			if (error.data && error.data.error) {
				text = error.data.error;
			}
			this.helper.setResponseText(text);
			return;
		}

		this.props.router.push(`/jobs/${this.data.jobId}`);
	};

	jobUpdated() {
		bus.off(busEvents.JOB_UPDATED, this.jobUpdated);
		const job = store.get(['job']);
		job['skills'] = job['skills'] ? job['skills'].split(',') : [];
		job['experienceLevel'] = levels[job['experienceLevelId'] - 1];
		job['speciality'] = specialitiesRow[job['specialityId']];
		job['created'] = new Date(job.date).toDateString();
		job['type'] = jobTypes.find(
			(el) => el.value === parseInt(job.jobTypeId),
		).label;

		this.data = {
			job: { ...job },
			title: 'Редактирование работы',
		};

		console.log('jobUpdated job', job);
		console.log('jobUpdated data.job', this.data.job);
		console.log('jobUpdated data', this.data);
		console.log('jobUpdated');

		this.stateChanged();
	}

	onDestroy() {
		console.log('onDestroy');

		this._specialitySelect.onDestroy();
	}

	utilsLoaded = () => {
		this.data = {
			countryList: UtilService.MapCountriesToSelectList(),
		};

		console.log('utilsLoaded');
		this.stateChanged();
	};
}

export default JobFormComponent;
