<template>
  <div :dir="dir" class="v-select" :class="stateClasses">
    <div ref="toggle" @mousedown.prevent="toggleDropdown" class="vs__dropdown-toggle">

      <div class="vs__selected-options" ref="selectedOptions">
        <slot v-for="option in selectedValue"
              name="selected-option-container"
              :option="normalizeOptionForSlot(option)"
              :deselect="deselect"
              :multiple="multiple"
              :disabled="disabled">
          <span class="vs__selected" v-bind:key="option.index">
            <slot name="selected-option" v-bind="normalizeOptionForSlot(option)">
              {{ getOptionLabel(option) }}
            </slot>
            <button v-if="multiple" :disabled="disabled" @click="deselect(option)" type="button" class="vs__deselect" aria-label="Deselect option">
              <component :is="childComponents.Deselect" />
            </button>
          </span>
        </slot>

        <slot name="search" v-bind="scope.search">
          <input class="vs__search" v-bind="scope.search.attributes" v-on="scope.search.events">
        </slot>
      </div>

      <div class="vs__actions">
        <button
          v-show="showClearButton"
          :disabled="disabled"
          @click="clearSelection"
          type="button"
          class="vs__clear"
          title="Clear selection"
        >
          <component :is="childComponents.Deselect" />
        </button>

        <slot name="open-indicator" v-bind="scope.openIndicator">
          <component :is="childComponents.OpenIndicator" v-if="!noDrop" v-bind="scope.openIndicator.attributes"/>
        </slot>

        <slot name="spinner" v-bind="scope.spinner">
          <div class="vs__spinner" v-show="mutableLoading">Loading...</div>
        </slot>
      </div>
    </div>

    <transition :name="transition">
      <ul ref="dropdownMenu" v-if="dropdownOpen" class="vs__dropdown-menu" role="listbox" @mousedown="onMousedown" @mouseup="onMouseUp">
        <li
          role="option"
          v-for="(option, index) in filteredOptions"
          :key="index"
          class="vs__dropdown-option"
          :class="{ 'vs__dropdown-option--selected': isOptionSelected(option), 'vs__dropdown-option--highlight': index === typeAheadPointer }"
          @mouseover="typeAheadPointer = index"
          @mousedown.prevent.stop="select(option)"
        >
          <slot name="option" v-bind="normalizeOptionForSlot(option)">
            {{ getOptionLabel(option) }}
          </slot>
        </li>
        <infinite-loading
          v-if="infiniteLoading"
          ref="infiniteLoading"
          @infinite="infiniteHandler">
          <span slot="no-more" />
          <span slot="no-results" />
        </infinite-loading>
        <li v-if="!filteredOptions.length" class="vs__no-options" @mousedown.stop="">
          <slot name="no-options">Sorry, no matching options.</slot>
        </li>
      </ul>
    </transition>
  </div>
</template>

<script>
/* eslint-disable */
import pointerScroll from './pointerScroll'
import typeAheadPointer from './typeAheadPointer'
import ajax from './ajax'
import childComponents from './childComponents'
import InfiniteLoading from 'vue-infinite-loading'

export default {
  components: {
    ...childComponents,
    InfiniteLoading
  },
  mixins: [pointerScroll, typeAheadPointer, ajax],
  props: {
    value: {
      type: String | Number,
      default: 0,
    },
    components: {
      type: Object,
      default: () => ({}),
    },
    option: {
      type: Object,
      required: false
    },
    options: {
      type: Array,
      default() {
        return []
      },
    },
    disabled: {
      type: Boolean,
      default: false
    },
    clearable: {
      type: Boolean,
      default: true
    },
    searchable: {
      type: Boolean,
      default: true
    },
    multiple: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    },
    transition: {
      type: String,
      default: 'vs__fade'
    },
    clearSearchOnSelect: {
      type: Boolean,
      default: true
    },
    closeOnSelect: {
      type: Boolean,
      default: true
    },
    label: {
      type: String,
      default: 'label'
    },
    autocomplete: {
      type: String,
      default: 'off'
    },
    reduce: {
      type: Function,
      default: option => option,
    },
    fetchData: {
      type: Function,
      required: false
    },
    infiniteLoading: {
      type: Boolean,
      default: true
    },
    getOptionLabel: {
      type: Function,
      default(option) {
        if (typeof option === 'object') {
          if (!option.hasOwnProperty(this.label)) {
            return console.warn(
              `[vue-select warn]: Label key "option.${this.label}" does not` +
              ` exist in options object ${JSON.stringify(option)}.\n` +
              'http://sagalbot.github.io/vue-select/#ex-labels'
            )
          }
          return option[this.label]
        }
        return option;
      }
    },
    onTab: {
      type: Function,
      default: function () {
        if (this.selectOnTab) {
          this.typeAheadSelect();
        }
      },
    },
    taggable: {
      type: Boolean,
      default: false
    },
    tabindex: {
      type: Number,
      default: null
    },
    pushTags: {
      type: Boolean,
      default: false
    },
    filterable: {
      type: Boolean,
      default: true
    },
    filterBy: {
      type: Function,
      default(option, label, search) {
        return (label || '').toLowerCase().indexOf(search.toLowerCase()) > -1
      }
    },
    filter: {
      "type": Function,
      default(options, search) {
        return options.filter((option) => {
          let label = this.getOptionLabel(option)
          if (typeof label === 'number') {
            label = label.toString()
          }
          return this.filterBy(option, label, search)
        });
      }
    },
    createOption: {
      type: Function,
      default(newOption) {
        if (typeof this.optionList[0] === 'object') {
          newOption = {[this.label]: newOption}
        }
        this.$emit('option:created', newOption)
        return newOption
      }
    },
    resetOnOptionsChange: {
      type: Boolean,
      default: false
    },
    noDrop: {
      type: Boolean,
      default: false
    },
    inputId: {
      type: String
    },
    dir: {
      type: String,
      default: 'auto'
    },
    selectOnTab: {
      type: Boolean,
      default: false
    },
    searchInputQuerySelector: {
      type: String,
      default: '[type=search]'
    }
  },
  data() {
    return {
      search: '',
      open: false,
      pushedTags: [],
      _value: [] // Internal value managed by Vue Select if no `value` prop is passed
    }
  },
  watch: {
    options: {
      handler() {
        if (!this.taggable && this.resetOnOptionsChange) {
          this.clearSelection()
        }
        if (this.option) {
          const ids = this.options.map(option => JSON.stringify(this.reduce(option)))
          ids.forEach((id, index) => {
            if (ids.slice(0, index).includes(id)) {
              this.options.splice(index, 1)
            }
          })
        }
      },
      deep: true
    },
    option: {
      handler() {
        if (!this.option) {
          return false
        }
        const ids = this.options.map(option => JSON.stringify(this.reduce(option)))
        const optionId = JSON.stringify(this.reduce(this.option))
        if (!ids.includes(optionId)) {
          this.options.push(this.option)
        }
      },
      deep: true
    },
    multiple() {
      this.clearSelection()
    },
    value: {
      handler() {
        this.init()
      },
      deep: true
    },
    reduce: {
      handler() {
        this.init()
      }
    },
    search() {
      if (this.infiniteLoading) {
        this.$refs.infiniteLoading.stateChanger.reset()
      }
    }
  },
  mounted() {
    if (!this.infiniteLoading) {
      this.fetchData()
    }
  },
  created() {
    this.init()
    this.$on('option:created', this.maybePushTag)
  },
  methods: {
    init() {
      this.mutableLoading = this.loading;
      if (this.$options.propsData.hasOwnProperty('reduce') && this.value) {
        if (Array.isArray(this.value)) {
          this.$data._value = this.value.map(value => this.findOptionFromReducedValue(value));
        } else {
          this.$data._value = this.findOptionFromReducedValue(this.value);
        }
      }
    },

    select(option) {
      if (!this.isOptionSelected(option)) {
        if (this.taggable && !this.optionExists(option)) {
          option = this.createOption(option)
        }
        if (this.multiple) {
          option = this.selectedValue.concat(option)
        }
        this.updateValue(option);
      }
      this.onAfterSelect(option)
    },
    deselect (option) {
      this.updateValue(this.selectedValue.filter(val => {
        return !this.optionComparator(val, option);
      }));
    },
    clearSelection() {
      this.updateValue(this.multiple ? [] : null)
    },
    onAfterSelect(option) {
      if (this.closeOnSelect) {
        this.open = !this.open
        this.searchEl.blur()
      }
      if (this.clearSearchOnSelect) {
        this.search = ''
      }
    },
    updateValue (value) {
      if (this.isTrackingValues) {
        // Vue select has to manage value
        this.$data._value = value;
      }
      if (value !== null) {
        if (Array.isArray(value)) {
          value = value.map(val => this.reduce(val));
        } else {
          value = this.reduce(value);
        }
      }
      this.$emit('input', value);
    },
    toggleDropdown (e) {
      const target = e.target;
      const toggleTargets = [
        this.$el,
        this.searchEl,
        this.$refs.toggle.$el,
      ];
      if (typeof this.$refs.openIndicator !== 'undefined') {
        toggleTargets.push(
          this.$refs.openIndicator.$el,
          // the line below is a bit gross, but required to support IE11 without adding polyfills
          ...Array.prototype.slice.call(this.$refs.openIndicator.$el.childNodes),
        );
      }
      if (toggleTargets.indexOf(target) > -1 || target.classList.contains('vs__selected')) {
        if (this.open) {
          this.searchEl.blur(); // dropdown will close on blur
        } else {
          if (!this.disabled) {
            this.open = true;
            this.searchEl.focus();
          }
        }
      }
    },
    isOptionSelected(option) {
      return this.selectedValue.some(value => {
        return this.optionComparator(value, option)
      })
    },
    optionComparator(value, option) {
      if (typeof value !== 'object' && typeof option !== 'object') {
        // Comparing primitives
        if (value === option) {
          return true
        }
      } else {
        // Comparing objects
        if (value === this.reduce(option)) {
          return true
        }
        if ((this.getOptionLabel(value) === this.getOptionLabel(option)) || (this.getOptionLabel(value) === option)) {
          return true
        }
        if (this.reduce(value) === this.reduce(option)) {
          return true
        }
      }
      return false;
    },
    findOptionFromReducedValue (value) {
      return this.options.find(option => JSON.stringify(this.reduce(option)) === JSON.stringify(value)) || value;
    },
    closeSearchOptions(){
      this.open = false
      this.$emit('search:blur')
    },
    maybeDeleteValue() {
      if (!this.searchEl.value.length && this.selectedValue && this.clearable) {
        let value = null;
        if (this.multiple) {
          value = [...this.selectedValue.slice(0, this.selectedValue.length - 1)]
        }
        this.updateValue(value)
      }
    },
    optionExists(option) {
      return this.optionList.some(opt => {
        if (typeof opt === 'object' && this.getOptionLabel(opt) === option) {
          return true
        } else if (opt === option) {
          return true
        }
        return false
      })
    },
    normalizeOptionForSlot (option) {
      return (typeof option === 'object') ? option : {[this.label]: option};
    },
    maybePushTag(option) {
      if (this.pushTags) {
        this.pushedTags.push(option)
      }
    },
    onEscape() {
      if (!this.search.length) {
        this.searchEl.blur()
      } else {
        this.search = ''
      }
    },
    onSearchBlur() {
      if (this.mousedown && !this.searching) {
        this.mousedown = false
      } else {
        if (this.clearSearchOnBlur) {
          this.search = ''
        }
        this.closeSearchOptions()
        return
      }
      // Fixed bug where no-options message could not be closed
      if (this.search.length === 0 && this.options.length === 0){
        this.closeSearchOptions()
        return
      }
    },
    onSearchFocus() {
      this.open = true
      this.$emit('search:focus')
    },
    onMousedown() {
      this.mousedown = true
    },
    onMouseUp() {
      this.mousedown = false
    },
    onSearchKeyDown (e) {
      switch (e.keyCode) {
        case 8:
          //  delete
          return this.maybeDeleteValue();
        case 9:
          //  tab
          return this.onTab();
      }
    },
    onSearchKeyUp (e) {
      switch (e.keyCode) {
        case 27:
          //  esc
          return this.onEscape();
        case 38:
          //  up.prevent
          e.preventDefault();
          return this.typeAheadUp();
        case 40:
          //  down.prevent
          e.preventDefault();
          return this.typeAheadDown();
        case 13:
          //  enter.prevent
          e.preventDefault();
          return this.typeAheadSelect();
      }
    },
    async infiniteHandler($state) {
      if (!this.fetchData) {
        if (this.infiniteLoading) {
          $state.complete()
        }
        return false
      }
      const response = await this.fetchData()
      if (this.infiniteLoading) {
        $state.loaded()
        if (response.total < response.limit * response.page) {
          $state.complete()
        }
      }
    }
  },
  computed: {
    isTrackingValues () {
      return (typeof this.value === 'undefined' || this.$options.propsData.hasOwnProperty('reduce')) && this.value !== null && this.value != '';
    },
    selectedValue () {
      let value = this.value;
      if (this.isTrackingValues) {
        // Vue select has to manage value internally
        value = this.$data._value;
      }
      if (value && value !== '' && value !== null) {
        return [].concat(value);
      }
      return [];
    },
    optionList () {
      return this.options.concat(this.pushedTags);
    },
    searchEl () {
      return !!this.$scopedSlots['search']
        ? this.$refs.selectedOptions.querySelector(this.searchInputQuerySelector)
        : this.$refs.search;
    },
    scope () {
      return {
        search: {
          attributes: {
            'disabled': this.disabled,
            'placeholder': this.searchPlaceholder,
            'tabindex': this.tabindex,
            'readonly': !this.searchable,
            'id': this.inputId,
            'aria-expanded': this.dropdownOpen,
            'aria-label': 'Search for option',
            'ref': 'search',
            'role': 'combobox',
            'type': 'search',
            'autocomplete': 'off',
            'value': this.search,
          },
          events: {
            'keydown': this.onSearchKeyDown,
            'keyup': this.onSearchKeyUp,
            'blur': this.onSearchBlur,
            'focus': this.onSearchFocus,
            'input': (e) => this.search = e.target.value
          },
        },
        spinner: {
          loading: this.mutableLoading
        },
        openIndicator: {
          attributes: {
            'ref': 'openIndicator',
            'role': 'presentation',
            'class': 'vs__open-indicator',
          },
        },
      };
    },
    childComponents () {
      return {
        ...childComponents,
        ...this.components
      };
    },
    stateClasses() {
      return {
        'vs--open': this.dropdownOpen,
        'vs--single': !this.multiple,
        'vs--searching': this.searching && !this.noDrop,
        'vs--searchable': this.searchable && !this.noDrop,
        'vs--unsearchable': !this.searchable,
        'vs--loading': this.mutableLoading,
        'vs--disabled': this.disabled
      }
    },
    clearSearchOnBlur() {
      return this.clearSearchOnSelect && !this.multiple
    },
    searching() {
      return !! this.search
    },
    dropdownOpen() {
      return this.noDrop ? false : this.open && !this.mutableLoading
    },
    searchPlaceholder() {
      if (this.isValueEmpty && this.placeholder) {
        return this.placeholder;
      }
    },
    filteredOptions() {
      const optionList = [].concat(this.optionList);
      if (!this.filterable && !this.taggable) {
        return optionList;
      }
      let options = this.search.length ? this.filter(optionList, this.search, this) : optionList;
      if (this.taggable && this.search.length && !this.optionExists(this.search)) {
        options.unshift(this.search)
      }
      this.$emit('filtered-options', options)
      return options
    },
    isValueEmpty() {
      return this.selectedValue.length === 0;
    },
    showClearButton() {
      return !this.multiple && this.clearable && !this.open && !this.isValueEmpty
    }
  },
}
</script>