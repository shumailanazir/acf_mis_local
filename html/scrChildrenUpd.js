module.exports.initScrChildrenUpd = function (){
  $(()=>{
    $('input[type="number"]').attr('min',0);
  })
  $(function () {
    var datePickerId = document.getElementById('txtScrChildDate');
    datePickerId.max = new Date().toISOString().split("T")[0];
  });
  $(function(){
    ipc.send('getProvince');
    ipc.on('province', function(evt, province){
      $('#ddProvince').children('option:not(:first)').remove();   
      prov(province);
      })
      $('#ddProvince').on('change', function(){
        var prov = $(this).val();
        ipc.send('getDistrict', prov )
        ipc.on('district', function(evt, district){
          $('#ddDistrict').children('option:not(:first)').remove();

        dist(district);
        })
      })
      $('#ddDistrict').on('change', function(){
        var dist = $(this).val();
        ipc.send('getTehsil', dist )
        ipc.on('tehsil', function(evt, tehsil){
          $('#ddTehsil').children('option:not(:first)').remove();
  
        teh(tehsil);
        })
      })
      $('#ddTehsil').on('change', function(){
        var tehs = $(this).val();
        ipc.send('getUC', tehs )
        ipc.on('uc', function(evt, uc){
          $('#ddUC').children('option:not(:first)').remove();
        
        ucListener(uc);
        })
      })
      var ucForHH;
      $('#ddUC').on('change', function(){
        var ucs = $(this).val();
        ucForHH = ucs
        ipc.send('getHealthHouse', ucs )
        ipc.on('hh', function(evt, hh){
          $('#ddHealthHouse').children('option:not(:first)').remove();
        hhListener(hh);
        })
      })
    })
  $(()=>{
    function prepareQry() {
      var qry = {};
      ($('#ddProvince').val()) ? qry.province_id = $('#ddProvince').val(): '';
      ($('#ddDistrict').val()) ? qry.district_id = $('#ddDistrict').val(): '';
      ($('#ddTehsil').val()) ? qry.tehsil_id = $('#ddTehsil').val(): '';
      ($('#ddUC').val()) ? qry.uc_id = $('#ddUC').val(): '';
      ($('#ddInterval').val() == 1) ? qry.date = {
        x: 'screening_date',
        y: [$('#start_date').val(), $('#end_date').val()]
      }: '';
      console.log(qry);
      return qry;
    }
    var MyDateField = function(config) {
      jsGrid.Field.call(this, config);
      };
    
    MyDateField.prototype = new jsGrid.Field({
    
    css: "date-field",            // redefine general property 'css'
    align: "center",              // redefine general property 'align'
    
     
    sorter: function(date1, date2) {
        return new Date(date1) - new Date(date2);
    },
    
    itemTemplate: function(value) {
        return new Date(value).toDateString();
    },
    
    insertTemplate: function(value) {
        return this._insertPicker = $("<input>").datepicker({ defaultDate: new Date() });
    },
    
    editTemplate: function(value) {
        return this._editPicker = $("<input>").datepicker().datepicker("setDate", new Date(value));
    },
    
    insertValue: function() {
        return this._insertPicker.datepicker("getDate").toISOString();
    },
    
    editValue: function() {
        return this._editPicker.datepicker("getDate").toISOString();
    }
    });
    jsGrid.fields.date = MyDateField;
    $(function () {
      $('#ddInterval').on('change', function () {
        var value = $(this).val();
        console.log(value);
        if (value == 1) {
          $('#start_date').attr('disabled', false);
          $('#end_date').attr('disabled', false);
        } else {
          $('#start_date').attr('disabled', true);
          $('#end_date').attr('disabled', true);
        }
      })
    })
    function scrChilrenData(qry){
      return new Promise((resolve,reject)=>{
        ipc.send('allScrChildren', (qry));
        ipc.on('allScrChildren', (e, result)=>{
          var s = {
            data: result.result,
            itemsCount: result.result.length
          }
          if(result.err){
            reject(result.err)
            ipc.removeAllListeners('allScrChildren')
          } else {
              resolve(s);
          }
      })
      })
      
    };
    // var allData = scrChilrenData(prepareQry());
    $('#showDataScrChildren').on('click', (e)=>{
      console.log(prepareQry())
      $('#jsGrid').jsGrid({
        width:'auto',
        height:'auto',
        editing: true,
        sorting: true,
        paging: true,
        autoload: true,
        pageLoading: true,
        // data: allData,
        controller:{
          loadData:()=>{
           return scrChilrenData(prepareQry()); 
          }
        },
        fields:[{
          name:'screening_date',
          title:'Date',
          type:'text',
          editing: false
          // editing:false
        },{
          name:'village',
          title:'Village',
          type:'text',
          editing: false
        },{
          name:'total_scr_girls',
          title:'Total Screened Girls',
          type:'number',
          editing: false
        },{
          name:'total_scr_boys',
          title:'Total Screened Boys',
          type:'number',
          editing: false
        }],
        rowClick: function(args){
          this.editItem(args.item);
          var data = args.item;
          var dataKeys = Object.keys(data);
          console.log(dataKeys)
          dataKeys.forEach(el=>{
              $(`input[name="${el}"]`).val(data[el]);
              console.log(data[el])
            // }
          })
          // $('#p_name').val(data.p_name);
          // $('#gender').val(data.gender);
          // $('#village').val(data.site_village);
          // $('#otp_id').val(data.otp_id);
          console.log(args.item);
        }
      })
    })
  })
  $('#submitScrChildUpdForm').on('click', (e)=>{
    // console.log(data);
    $('#scrChildrenUpdForm').validate();
    if($('#scrChildrenUpdForm').valid()){
      var scrChildrenUpdData = $('#scrChildrenUpdForm').serializeFormJSON();
      console.log(scrChildrenUpdData);
      ipc.send('scrChildrenUpd', scrChildrenUpdData);
      ipc.removeAllListeners('scrChildrenUpd');
      $('#scrChildrenUpdForm').get(0).reset();
    $('input[type="number"]').attr('min',0);
    $('#jsGrid').jsGrid("render").done(()=>{
      console.log('js grid rendered')
    })
    } 
    e.preventDefault();
  })
}