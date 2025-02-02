import Ember from 'ember';

const { inject: { service } } = Ember;


import AxisEvents from '../../utils/draw/axis-events';
import { stacks, Stacked } from '../../utils/stacks';
import { selectAxis, blockAdjKeyFn, blockAdjEltId, foregroundSelector, selectBlockAdj } from '../../utils/draw/stacksAxes';

/* global d3 */

/*----------------------------------------------------------------------------*/

/** Used for CSS selectors targeting <g> and <path>-s generated by this component. */
const className = "block-feature-path";

let axisApi;

let trace_path = 1;


/*----------------------------------------------------------------------------*/

/** This component supports the general case of alignment between two blocks (on adjacent axes).
 * If the feature names on the 2 blocks is the same, we term this a direct alignment.
 * Otherwise the aligment may be established via some form of alias, and the
 * feature names on the 2 blocks may be different.
 *
 * The component's focus (scope of responsibility) is the data associated with
 * the path, and attributes derived from that.  i.e. key and attr functions for
 * <path>-s can use the component's CFs, including stroke - path colour, and
 * this component will absorb functions flagged with 'paths-classes' in
 * draw-map.js;   path hover text & popovers;
 * The svg render of the <path> is be done by the parent component via d3 .data() join.
 *
 * @param ffaa  i.e. feature0, feature1, block0, block1
 */
export default Ember.Component.extend({
  /** 
   * Related : unique_1_1_mapping, pathDataInG
   */

    /** Determine the svg <path> data attribute for this component.
     * @param ffaa  [feature0, feature1, a0, a1]
     */
  // pathU needs to depend also on the positions of the stacked axes, which will
  // be possible when stacks / axes are components, then this can be a computed function.
  pathU : /*Ember.computed('feature0', 'feature1', 'block0', 'block1',*/ function() {
    // based on draw-map.js : pathU(), pathUg(); this is equivalent and can replace those functions. (related : dataOfPath()).
    if (! axisApi)
      axisApi = stacks.oa.axisApi;
    let p = [];
    p[0] = axisApi.patham(this.get('block0'), this.get('block1'), this.get('feature0.name'), this.get('feature1.name'));
    let axisName2MapChr = axisApi.axisName2MapChr;
    if (trace_path > 1)
      console.log(
        "pathU",
        axisName2MapChr(this.block0), axisName2MapChr(this.block1),
        this.feature0, this.feature1, p[0]);
    return p;
  }/*)*/,

  /** Used to filter a selection of paths to find those whose blocks both have axes or not.
   * Depends on .block0 and .block1, but also on stacks, so this can be a CF
   * when stacks & axes are Components.
   */
  blocksHaveAxes() {
    let getAxis = Stacked.getAxis;
    return getAxis(this.block0) && getAxis(this.block1);
  }


});
