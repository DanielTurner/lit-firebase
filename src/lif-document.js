import { UpdatingElement} from 'lit-element';
import { default as FirebaseDatabase } from './lif-database-mixin.js';

class  LitFirebaseDocument extends FirebaseDatabase(UpdatingElement) {

  static get properties() {
    return {
      ...super.properties,

      /*
       * `data` data to set at db level
       */
      data: {
        type: Object
      },
    }
  }

    disconnectedCallback() {
      super.disconnectedCallback()
      if(this.ref) {
         this.ref.off('value', this.onValue, this);
      }
    }

    update(props) {
      super.update(props);
      this.log && console.info('update document props', props.keys());
      if(props.has('ref')) {
        this.__setRef(this.ref, props.get('ref'))
      }
      if(props.has('data')) {
        this.__setData(this.data)
      }
    }

    __setData(data) {
      
      const setData = (value) => this.ref.set(value).catch( e => this.onError(e))
       
      // Note(cg): only set data once __remote is known.
      if(this.__remote === undefined) {
        this.addEventListener('data-changed', () => {setData(data)}, {once: true})
        return;
      }
      setData(data);
    }
    
    __setRef(ref, old) {
      if(old) {
        this.__remote = undefined;
        old.off('value', this.onValue, this);
      }
      if(ref) {
        ref.on('value', this.onValue, this.onError,this);
      }
    }

    onValue(snap) {
      this.__remote = snap.val();
      this.log && console.info('read value', this.__remote);
      this.dispatchValue();
      
    }
}

export default LitFirebaseDocument;

// Register the new element with the browser.
customElements.define('lif-document',  LitFirebaseDocument);
