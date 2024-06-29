import React, { useEffect, useState } from 'react';
import { jsPDF } from "jspdf";
import "jspdf-barcode";
import "./msjh-normal.js";

const DataTable = () => {
  const kg2Barrel = [270, 10, 2];
  const barrel2Box = [2, 2, 8];
  const box2Pallet = [1, 32, 48];
  const [barrels, setBarrels] = useState([0, 0, 0]);
  const [boxes, setBoxes] = useState([0, 0, 0]);
  const [pallets, setPallets] = useState([0, 0, 0]);
  const rowHeaders = ['906Z', '5299 A', '5299 B'];

  const [order, setOrder] = useState('');

  const [weights, setWeights] = useState([0, 0, 0]);

  // Initial table data state with three rows and three cells each containing three values
  const [tableData, setTableData] = useState([
    { columns: [{ val1: '', val2: '', val3: 0 }, { val1: '', val2: '', val3: 0 }] },
    { columns: [{ val1: '', val2: '', val3: 0 }, { val1: '', val2: '', val3: 0 }] },
    { columns: [{ val1: '', val2: '', val3: 0 }, { val1: '', val2: '', val3: 0 }] }
  ]);

  const [totalBoxes, setTotalBoxes] = useState([0, 0, 0]);

  useEffect(() => {
    const newTotalBoxes = [0, 0, 0];
    for (let i = 0; i < 3; i++) {
      let total = 0;
      for (const col of tableData[i].columns) {
        total += Number(col.val3);
      }
      newTotalBoxes[i] = total;
    }
    setTotalBoxes(newTotalBoxes);
  }, [tableData]);

  const [classNames, setClassNames] = useState(['white', 'white', 'white']);

  useEffect(() => {
    console.log('Total Boxes:', totalBoxes);
    console.log('Boxes:', boxes);
    const newClassNames = [...classNames];
    for (let i = 0; i < 3; i++) {
      if(totalBoxes[i] > boxes[i]){
        newClassNames[i] = 'red';
      }
      else if(totalBoxes[i] == boxes[i]){
        newClassNames[i] = 'green';
      }
      else{
        newClassNames[i] = 'white';
      }
    }
    setClassNames(newClassNames);
  }, [totalBoxes, boxes]);

  const addColumn = () => {
    setTableData(tableData.map(row => ({ ...row, columns: [...row.columns, { val1: '', val2: '', val3: '' }] })));
  };

  const handleOrderChange = (event) => {
    const { value } = event.target;
    setOrder(value);
  };

  const handleWeightsChange = (rowIndex, event) => {
    const { value } = event.target;
    const newWeights = [...weights];
    newWeights[rowIndex] = Number(value);
    setWeights(newWeights);
    const newBarrels = [...barrels];
    newBarrels[rowIndex] = Math.ceil(newWeights[rowIndex] / kg2Barrel[rowIndex]);
    setBarrels(newBarrels);
    const newBoxes = [...boxes];
    newBoxes[rowIndex] = Math.ceil(newBarrels[rowIndex] / barrel2Box[rowIndex]);
    setBoxes(newBoxes);
    const newPallets = [...pallets];
    newPallets[rowIndex] = Math.ceil(newBoxes[rowIndex] / box2Pallet[rowIndex]);
    setPallets(newPallets);
  };

  // Handle input change
  const handleInputChange = (rowIndex, colName, colIndex, valueIndex, event) => {
    const { value } = event.target;
    const newTableData = [...tableData];
    newTableData[rowIndex][colName][colIndex][valueIndex] = value;
    setTableData(newTableData);
  };

  function checkSum128(data, startCode) {
    var sum = startCode;
    for (var i = 0; i < data.length; i++) {
      var code = data.charCodeAt(i);
      var value = code > 199 ? code - 100 : code - 32;
      sum += (i + 1) * (value);
    }
  
    var checksum = (sum % 103) + 32;
    if (checksum > 126) checksum = checksum + 68 ;
    return String.fromCharCode(checksum);
  }

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    if(totalBoxes[0] != boxes[0] || totalBoxes[1] != boxes[1] || totalBoxes[2] != boxes[2]){
      alert('Error');
      return;
    }
    var doc = new jsPDF('portrait', 'in', 'a4');
    doc.setFont("msjh");
    doc.setLineWidth(0.005);
    const stickerHeight = 3.9; // inches
    const stickerWidth = 3.6; // inches
    const marginLeft = 0.5; // inches
    const marginTop = 0.5; // inches

    const positions = [
      { x: marginLeft, y: 0 },
      { x: marginLeft + stickerWidth, y: 0 },
      { x: marginLeft, y: stickerHeight },
      { x: marginLeft + stickerWidth, y: stickerHeight },
      { x: marginLeft, y: 2 * stickerHeight },
      { x: marginLeft + stickerWidth, y: 2 * stickerHeight }
    ];

    const base = 0.4;
    const offset = 0.26;

    // 906Z
    for(let i = 0; i < Math.ceil(boxes[0] / 6); i++){
      var j = 1;
      for(const pos of positions){
        var number = i * 6 + j;
        var numBarrels = 2;
        if(barrels[0] % 2 == 1 && number == boxes[0]) numBarrels = barrels[0] % 2;
        if(number > boxes[0]) break;
        var sum = 0;
        var lotNo = '';
        var date = '';
        for(const col of tableData[0].columns){
          sum += Number(col.val3);
          lotNo = col.val1;
          date = col.val2;
          if(sum >= number){
            break;
          }
        }
        var dateOjb = new Date(date);
        dateOjb.setFullYear(dateOjb.getFullYear() + 1);
        dateOjb.setDate(dateOjb.getDate() - 1);
        var expDate = dateOjb.getFullYear() + '/' + String(dateOjb.getMonth() + 1).padStart(2, '0') + '/' + String(dateOjb.getDate()).padStart(2, '0');
        doc.rect(pos.x, pos.y, stickerWidth, stickerHeight);
        doc.setFontSize(14);
        doc.text("鑫諾發股份有限公司", pos.x + stickerWidth / 2, pos.y + base, 'center');
        doc.setFontSize(12);
        doc.text("產品名稱：", pos.x + stickerWidth / 4, pos.y + base + offset, 'right');
        doc.text("料號：", pos.x + stickerWidth / 4, pos.y + base + offset * 3, 'right');
        doc.text("訂單號碼：", pos.x + stickerWidth / 4, pos.y + base + offset * 4, 'right');
        doc.text("Lot No：", pos.x + stickerWidth / 4, pos.y + base + offset * 5, 'right');
        doc.text("製造日期：", pos.x + stickerWidth / 4, pos.y + base + offset * 8, 'right');
        doc.text("保存期限：", pos.x + stickerWidth / 4, pos.y + base + offset * 9, 'right');
        doc.text("數量：", pos.x + stickerWidth / 4, pos.y + base + offset * 10, 'right');
        doc.text("箱號：", pos.x + stickerWidth / 4, pos.y + base + offset * 11, 'right');
        
        doc.text("鋁框灌封矽膠", pos.x + stickerWidth * 0.6, pos.y + base + offset, 'center');
        doc.text("Huitian 906Z,270kg", pos.x + stickerWidth * 0.6, pos.y + base + offset * 2, 'center');
        doc.text("MMNPFHUTHT906ZWB-002", pos.x + stickerWidth * 0.6, pos.y + base + offset * 3, 'center');
        doc.text(order, pos.x + stickerWidth * 0.6, pos.y + base + offset * 4, 'center');
        doc.text(lotNo, pos.x + stickerWidth * 0.6, pos.y + base + offset * 5, 'center');
        doc.text(date, pos.x + stickerWidth * 0.6, pos.y + base + offset * 8, 'center');
        doc.text(expDate, pos.x + stickerWidth * 0.6, pos.y + base + offset * 9, 'center');
        doc.text(numBarrels + "桶", pos.x + stickerWidth * 0.6, pos.y + base + offset * 10, 'center');
        doc.text(number + "/" + boxes[0], pos.x + stickerWidth * 0.6, pos.y + base + offset * 11, 'center');
        
        doc.barcode(lotNo, {
          fontSize: 34,
          textColor: "#000000",
          x: pos.x + stickerWidth / 2,
          y: pos.y + base + offset * 7,
          textOptions: { align: "center" } // optional text options
        });
        doc.setFont("msjh");
        j++;
      }
      doc.addPage();
    }
    
    doc.save("906Z.pdf");

    // 5299A
    doc = new jsPDF('portrait', 'in', 'a4');
    doc.setFont("msjh");
    doc.setLineWidth(0.005);

    for(let i = 0; i < Math.ceil(boxes[1] / 6); i++){
      var j = 1;
      for(const pos of positions){
        var number = i * 6 + j;
        var numBarrels = 2;
        if(barrels[1] % 2 != 0 && number == boxes[1]) numBarrels = barrels[1] % 2;
        if(number > boxes[1]) break;
        var sum = 0;
        var lotNo = '';
        var date = '';
        for(const col of tableData[1].columns){
          sum += Number(col.val3);
          lotNo = col.val1;
          date = col.val2;
          if(sum >= number){
            break;
          }
        }
        var dateOjb = new Date(date);
        dateOjb.setMonth(dateOjb.getMonth() + 8);
        dateOjb.setDate(dateOjb.getDate() - 1);
        var expDate = dateOjb.getFullYear() + '/' + String(dateOjb.getMonth() + 1).padStart(2, '0') + '/' + String(dateOjb.getDate()).padStart(2, '0');
        doc.rect(pos.x, pos.y, stickerWidth, stickerHeight);
        doc.setFontSize(14);
        doc.text("鑫諾發股份有限公司", pos.x + stickerWidth / 2, pos.y + base, 'center');
        doc.setFontSize(12);
        doc.text("產品名稱：", pos.x + stickerWidth / 4, pos.y + base + offset, 'right');
        doc.text("料號：", pos.x + stickerWidth / 4, pos.y + base + offset * 3, 'right');
        doc.text("訂單號碼：", pos.x + stickerWidth / 4, pos.y + base + offset * 4, 'right');
        doc.text("Lot No：", pos.x + stickerWidth / 4, pos.y + base + offset * 5, 'right');
        doc.text("製造日期：", pos.x + stickerWidth / 4, pos.y + base + offset * 8, 'right');
        doc.text("保存期限：", pos.x + stickerWidth / 4, pos.y + base + offset * 9, 'right');
        doc.text("數量：", pos.x + stickerWidth / 4, pos.y + base + offset * 10, 'right');
        doc.text("箱號：", pos.x + stickerWidth / 4, pos.y + base + offset * 11, 'right');
        
        doc.text("接線盒灌封矽膠", pos.x + stickerWidth * 0.6, pos.y + base + offset, 'center');
        doc.text("HuiTian 5299WS-A,10kg", pos.x + stickerWidth * 0.6, pos.y + base + offset * 2, 'center');
        doc.text("MMNPBHUT5299WSAB-002", pos.x + stickerWidth * 0.6, pos.y + base + offset * 3, 'center');
        doc.text(order, pos.x + stickerWidth * 0.6, pos.y + base + offset * 4, 'center');
        doc.text(lotNo, pos.x + stickerWidth * 0.6, pos.y + base + offset * 5, 'center');
        doc.text(date, pos.x + stickerWidth * 0.6, pos.y + base + offset * 8, 'center');
        doc.text(expDate, pos.x + stickerWidth * 0.6, pos.y + base + offset * 9, 'center');
        doc.text(numBarrels + "桶", pos.x + stickerWidth * 0.6, pos.y + base + offset * 10, 'center');
        doc.text(number + "/" + boxes[1], pos.x + stickerWidth * 0.6, pos.y + base + offset * 11, 'center');
        
        doc.barcode(lotNo, {
          fontSize: 34,
          textColor: "#000000",
          x: pos.x + stickerWidth / 2,
          y: pos.y + base + offset * 7,
          textOptions: { align: "center" } // optional text options
        });
        doc.setFont("msjh");
        j++;
      }
      doc.addPage();
    }
    doc.save("5299A.pdf");

    // 5299B
    doc = new jsPDF('portrait', 'in', 'a4');
    doc.setFont("msjh");
    doc.setLineWidth(0.005);

    for(let i = 0; i < Math.ceil(boxes[2] / 6); i++){
      var j = 1;
      for(const pos of positions){
        var number = i * 6 + j;
        var numBarrels = 8;
        if(barrels[2] % 8 != 0 && number == boxes[2]) numBarrels = barrels[2] % 8;
        if(number > boxes[2]) break;
        var sum = 0;
        var lotNo = '';
        var date = '';
        for(const col of tableData[2].columns){
          sum += Number(col.val3);
          lotNo = col.val1;
          date = col.val2;
          if(sum >= number){
            break;
          }
        }
        var dateOjb = new Date(date);
        dateOjb.setMonth(dateOjb.getMonth() + 8);
        dateOjb.setDate(dateOjb.getDate() - 1);
        var expDate = dateOjb.getFullYear() + '/' + String(dateOjb.getMonth() + 1).padStart(2, '0') + '/' + String(dateOjb.getDate()).padStart(2, '0');
        doc.rect(pos.x, pos.y, stickerWidth, stickerHeight);
        doc.setFontSize(14);
        doc.text("鑫諾發股份有限公司", pos.x + stickerWidth / 2, pos.y + base, 'center');
        doc.setFontSize(12);
        doc.text("產品名稱：", pos.x + stickerWidth / 4, pos.y + base + offset, 'right');
        doc.text("料號：", pos.x + stickerWidth / 4, pos.y + base + offset * 3, 'right');
        doc.text("訂單號碼：", pos.x + stickerWidth / 4, pos.y + base + offset * 4, 'right');
        doc.text("Lot No：", pos.x + stickerWidth / 4, pos.y + base + offset * 5, 'right');
        doc.text("製造日期：", pos.x + stickerWidth / 4, pos.y + base + offset * 8, 'right');
        doc.text("保存期限：", pos.x + stickerWidth / 4, pos.y + base + offset * 9, 'right');
        doc.text("數量：", pos.x + stickerWidth / 4, pos.y + base + offset * 10, 'right');
        doc.text("箱號：", pos.x + stickerWidth / 4, pos.y + base + offset * 11, 'right');
        
        doc.text("接線盒灌封矽膠", pos.x + stickerWidth * 0.6, pos.y + base + offset, 'center');
        doc.text("HuiTian 5299WS-B,2kg", pos.x + stickerWidth * 0.6, pos.y + base + offset * 2, 'center');
        doc.text("MMNPBHUT5299WSBB-002", pos.x + stickerWidth * 0.6, pos.y + base + offset * 3, 'center');
        doc.text(order, pos.x + stickerWidth * 0.6, pos.y + base + offset * 4, 'center');
        doc.text(lotNo, pos.x + stickerWidth * 0.6, pos.y + base + offset * 5, 'center');
        doc.text(date, pos.x + stickerWidth * 0.6, pos.y + base + offset * 8, 'center');
        doc.text(expDate, pos.x + stickerWidth * 0.6, pos.y + base + offset * 9, 'center');
        doc.text(numBarrels + "桶", pos.x + stickerWidth * 0.6, pos.y + base + offset * 10, 'center');
        doc.text(number + "/" + boxes[2], pos.x + stickerWidth * 0.6, pos.y + base + offset * 11, 'center');
        
        doc.barcode(lotNo, {
          fontSize: 34,
          textColor: "#000000",
          x: pos.x + stickerWidth / 2,
          y: pos.y + base + offset * 7,
          textOptions: { align: "center" } // optional text options
        });
        doc.setFont("msjh");
        j++;
      }
      doc.addPage();
    }

    doc.save("5299B.pdf");

    console.log('Submitted Table Data:', tableData, 'Order:', order);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h1>{}</h1>
        <label>
          元晶訂單號&nbsp;
        </label>
        <input type="text" name="order" value={order} onChange={handleOrderChange}/>
      </div><br/>

      <table>
        <thead>
          <tr>
            <th></th>
            <th>重量</th>
            <th>桶數&nbsp;&nbsp;&nbsp;</th>
            <th>箱數&nbsp;&nbsp;&nbsp;</th>
            <th>托數&nbsp;&nbsp;&nbsp;</th>
            {tableData[0].columns.map((_, colIndex) => (
              <th key={colIndex}>{colIndex + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex} class={classNames[rowIndex]}>
              <th>{rowHeaders[rowIndex]}</th>
              <input
                type="number"
                value={weights[rowIndex]}
                onChange={(event) => handleWeightsChange(rowIndex, event)}
                placeholder="重量"
              />
              <td>{barrels[rowIndex]}</td>
              <td>{boxes[rowIndex]}</td>
              <td>{pallets[rowIndex]}</td>
              {row.columns.map((col, colIndex) => (
                <td key={'col' + colIndex}>
                  
                    <input
                      type="text"
                      value={col.val1}
                      onChange={(event) => handleInputChange(rowIndex, 'columns', colIndex, 'val1', event)}
                      placeholder="Lot No"
                    /><br/>
                    <input
                      type="text"
                      value={col.val2}
                      onChange={(event) => handleInputChange(rowIndex, 'columns', colIndex, 'val2', event)}
                      placeholder="生產日期 (yyyy/mm/dd)"
                    /><br/>
                    <input
                      type="number"
                      value={col.val3}
                      onChange={(event) => handleInputChange(rowIndex, 'columns', colIndex, 'val3', event)}
                      placeholder="Value 3"
                    />
                </td>
              ))}
            </tr>
          ))}
          <tr class="white">
            <th>合計</th>
            <td>{weights.reduce((a, b) => a + b, 0)}</td>
            <td>{barrels.reduce((a, b) => a + b, 0)}</td>
            <td>{boxes.reduce((a, b) => a + b, 0)}</td>
            <td>{pallets.reduce((a, b) => a + b, 0)}</td>
          </tr>
        </tbody>
      </table>
      <button type="button" onClick={addColumn}>Add Column</button>
      <button type="submit">Submit</button>
    </form>
  );
};

export default DataTable;