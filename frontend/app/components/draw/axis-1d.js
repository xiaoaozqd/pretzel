import Ember from 'ember';

import AxisEvents from '../../utils/draw/axis-events';
import { /* Block, Stacked, Stack,*/ stacks /*, xScaleExtend, axisRedrawText, axisId2Name*/ } from '../../utils/stacks';
import {  /* Axes, yAxisTextScale,  yAxisTicksScale,  yAxisBtnScale, yAxisTitleTransform, eltId,*/ axisEltId /*, eltIdAll, highlightId*/  }  from '../../utils/draw/axis';
import {DragTransition, dragTransitionTime, dragTransitionNew, dragTransition } from '../../utils/stacks-drag';


/* global d3 */


/*------------------------------------------------------------------------*/

/* milliseconds duration of transitions in which axis ticks are drawn / changed.
 * Match with time used by draw-map.js : zoom() and resetZoom() : 750.
 * also @see   dragTransitionTime.
 */
const axisTickTransitionTime = 750;

/*------------------------------------------------------------------------*/


/*------------------------------------------------------------------------*/


/* showTickLocations() and configureHorizTickHover() are based on the
 * corresponding functions in draw-map.js
 * There is a lot of variation at all levels between this application and the
 * original - draft factoring (axisDomData.js) showed a blow-out of abstraction
 * and complexity even before all the differences were handled.
 */

const className = "horizTick";

/** filter : @return true if the given Block is configured to display ticks.
 * i.e. ! block.block.get('dataset').get('showPaths')
 */
function blockWithTicks(block)
{
  let showPaths = block.block.get('showPaths');
  // console.log('blockWithTicks', block.axisName, showPaths);
  return ! showPaths;
}


/** Draw horizontal ticks on the axes, at feature locations.
 * @param axis  Stacked
 * @param axisApi for lineHoriz
 */
function showTickLocations(axis, axisApi)
{
  let axisName = axis.axisName;

  let aS = d3.select("#" + axisEltId(axisName));
  if (!aS.empty())
  {

    let blocks = axis.blocks.filter(blockWithTicks);
    blocks.forEach(function (block) {
      let blockR = block.block,
      blockId = blockR.get('id'),
      features = blockR.get('features').toArray();

      let pS = aS.selectAll("path." + className)
        .data(features),
      pSE = pS.enter()
        .append("path")
        .attr("class", className);
      pSE
        .each(function (d) { return configureHorizTickHover.apply(this, [d, block, hoverTextFn]); });
      let pSM = pSE.merge(pS);

      /* update attr d in a transition if one was given.  */
      let p1 = // (t === undefined) ? pSM :
         pSM.transition()
         .duration(axisTickTransitionTime)
         .ease(d3.easeCubic);

      p1.attr("d", pathFn);

    });

  }

  function pathFn (feature) {
    // based on axisFeatureTick(ai, d)
    /** shiftRight moves right end of tick out of axis zone, so it can
     * receive hover events.
     */
    const xOffset = 25, shiftRight=5;
    let ak = axisName,
    range = feature.get('range') || feature.get('value'),
    tickY = range && (range.length ? range[0] : range),
    sLine = axisApi.lineHoriz(ak, tickY, xOffset, shiftRight);
    return sLine;
  };

  /** eg: "scaffold23432:1A:1-534243" */
  function hoverTextFn (feature, block) {
    let
      /** value is now renamed to range, this handles some older data. */
    range = feature.get('range') || feature.get('value'),
    rangeText = range && (range.length ? ('' + range[0] + ' - ' + range[1]) : range),
    blockR = block.block,
    // feature.get('name') 
    blockDesc = blockR && (blockR.get('name') + " : " + blockR.get('scope')),
    text = blockDesc + " : " + rangeText;
    return text;
  }
  // the code corresponding to hoverTextFn in the original is :
  // (location == "string") ? location :  "" + location;

}

/** Setup hover info text over scaffold horizTick-s.
 * @see based on similar configureAxisTitleMenu()
 */
function  configureHorizTickHover(d, block, hoverTextFn)
{
  // console.log("configureHorizTickHover", d, this, this.outerHTML);
  let text = hoverTextFn(d, block);
  let node_ = this;
  Ember.$(node_)
    .popover({
      trigger : "click hover",
      sticky: true,
      delay: {show: 200, hide: 3000},
      container: 'div#holder',
      placement : "auto right",
      // comment re. title versus content in @see draw-map.js: configureHorizTickHover() 
      content : text,
      html: false
    });
}

export default Ember.Component.extend(Ember.Evented, AxisEvents, {


  /** axis-1d receives axisStackChanged and zoomedAxis from draw-map
   * zoomedAxis is specific to an axisID, so respond to that if it matches this.axis.
   */

  axisStackChanged : function() {
    console.log("axisStackChanged in components/axis-1d");
    this.renderTicksDebounced();
  },

  /** @param [axisID, t] */
  zoomedAxis : function(axisID_t) {
    console.log("zoomedAxis in components/axis-1d", axisID_t);
    let axisID = axisID_t[0],
    axisName = this.get('axis.axisName');
    if (axisID == axisName)
    {
      console.log('zoomedAxis matched', axisID, this.get('axis'));
      this.renderTicksDebounced.apply(this, axisID_t);
    }
  },



  didInsertElement : function() {
    console.log('axis-1d didInsertElement', this, this.get('listen'), this.get('off'));
  },
  didRender() {
    this.get('renderTicks').apply(this, []);
  },
  renderTicks() {
    let block = this.get('axis'), blockId = block.get('id');
    let axisApi = this.get('drawMap.oa.axisApi');
    let oa = this.get('drawMap.oa');
    let axis = oa.axes[blockId];
    // console.log('axis-1d renderTicks', block, blockId, axis);

    showTickLocations(axis, axisApi);
  },
  renderTicksDebounced(axisID_t) {
    Ember.run.debounce(this, this.renderTicks, axisID_t, 250);
  }


  
});

