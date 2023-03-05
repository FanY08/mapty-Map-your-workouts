'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
// const btnsdelete = document.querySelectorAll('.btn--delete');

class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type.replace(
      this.type[0],
      this.type[0].toUpperCase()
    )} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }
}
class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }
  calcSpeed() {
    this.speed = this.duration / this.distance;
    return this.speed;
  }
}

///////////////////////////////
// APPLICATION  ARCHITECTURE
class APP {
  #map;
  #geolocation;
  #mapEvent;
  #workouts = [];

  constructor() {
    // Initial map
    this._mapInit();

    //  Get user's position
    this._getPosition();

    // Get data from local storage
    this._getLocalStorage();

    // Attach event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));
    //不使用bind就会指向form，注意这里要写的是函数赋值，而不是函数调用
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToMap.bind(this));
  }

  _mapInit() {
    this.#map = new BMapGL.Map('map');
    this.#geolocation = new BMapGL.Geolocation();
    this.#map.centerAndZoom(new BMapGL.Point(116.404, 39.915), 11); //先默认到北京，找到自己位置再切换
    this.#map.enableScrollWheelZoom(true); //可拖拽 放大缩小
  }

  _getPosition() {
    const self = this;
    this.#geolocation.getCurrentPosition(function (positon) {
      if (this.getStatus() == BMAP_STATUS_SUCCESS) {
        self._loadMap(positon); //如果这里用this，就指向geolocation，而不是app
      } else {
        alert('Could not get your position');
      }
    });
  }

  _loadMap(position) {
    const latitude = position.point.lat;
    const longitude = position.point.lng;
    this.#map.centerAndZoom(new BMapGL.Point(longitude, latitude), 11);
    // Handle clicks on map
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(work => {
      this._addMarker(work);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
  }

  _hidForm() {
    //Empty inputs
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
    // form.reset();
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    e.preventDefault();

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value; //字符串->number
    const duration = +inputDuration.value;
    const { lng, lat } = this.#mapEvent.latlng;
    let workout;

    // If workout running, creat running object
    if (type === 'running') {
      const cadence = +inputCadence.value;
      // Check if data is valid
      if (
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Input have to be positive numbers!');
      workout = new Running([lng, lat], distance, duration, cadence);
    }

    // If workout cycling, creat cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;
      // Check if data is valid
      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Input have to be positive numbers!');
      workout = new Cycling([lng, lat], distance, duration, elevation);
    }

    // add new object to workout array
    this.#workouts.push(workout);
    // render workout in map as marker

    // Display Marker
    this._addMarker(workout);

    // render workout on list
    this._renderWorkout(workout);
    // Hide form + Clear  input fields
    this._hidForm();

    //Set local storage to all workout
    this._setLocalStorage();
  }

  _addMarker(workout) {
    const point = new BMapGL.Point(...workout.coords);
    const marker = new BMapGL.Marker(point);
    //   const vectorMarker = new BMapLib.RichMarker();
    const infoBox = new BMapLib.InfoBox(this.#map, workout.description, {
      closeIconMargin: '0.5rem 0.5rem 0 0',
      enableAutoPan: true,
      boxClass: `infoBox infoBox-${workout.type}`,
    }); // 创建信息窗口对象
    this.#map.addOverlay(marker);
    marker.show();
    infoBox.open(marker.getPosition());
    // 打开信息窗口
    marker.addEventListener('click', function () {
      infoBox.open(marker.getPosition());
    });
  }

  _renderWorkout(workout) {
    let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;
    if (workout.type === 'running')
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
            `;
    if (workout.type === 'cycling')
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li>
    `;
    form.insertAdjacentHTML('afterend', html);
  }

  _moveToMap(e) {
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    const workout = this.#workouts.find(w => w.id === workoutEl.dataset.id);
    this.#map.panTo(new BMapGL.Point(...workout.coords));
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));
    if (!data) return;
    this.#workouts = data;
    this.#workouts.forEach(work => {
      this._renderWorkout(work);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new APP();
