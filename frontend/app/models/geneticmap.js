import Ember from 'ember';
import DS from 'ember-data';
import {
  fragmentArray,
} from 'model-fragments/attributes';

export default DS.Model.extend({
  name: DS.attr('string'),
  chromosomes: fragmentArray('chromosome'),

  extraMaps: [],
  isSelected: false,

  linkTo: Ember.computed('name', function() {
    return [this.get("id")];
  }),

  mapDeleteLink: Ember.computed('extraMaps', function() {
    let exMaps = this.get("extraMaps");
    let that = this;
    return exMaps.filter(function(mapid) { return mapid != that.get("id"); });
  }),

  mapLink: Ember.computed('extraMaps', function() {
    var retlist = this.get("extraMaps");
    if (retlist == null) {
      return [this.get("id")];
    }
    else {
      retlist.push(this.get("id"));
      return retlist;
    }
  })
});
