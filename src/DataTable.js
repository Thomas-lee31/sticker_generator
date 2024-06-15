import React, { useEffect, useState } from 'react';
import { jsPDF } from "jspdf";
import "jspdf-barcode";
import "./msjh-normal.js";

const DataTable = () => {
  const rowHeaders = ['906Z', '5299 A', '5299 B'];

  const [order, setOrder] = useState('');

  // Initial table data state with three rows and three cells each containing three values
  const [tableData, setTableData] = useState([
    { weight: 0, columns: [{ val1: '', val2: '', val3: 0 }, { val1: '', val2: '', val3: 0 }] },
    { weight: 0, columns: [{ val1: '', val2: '', val3: 0 }, { val1: '', val2: '', val3: 0 }] },
    { weight: 0, columns: [{ val1: '', val2: '', val3: 0 }, { val1: '', val2: '', val3: 0 }] }
  ]);

  const [totalWeights, setTotalWeights] = useState([0, 0, 0]);

  useEffect(() => {
    for (let i = 0; i < 3; i++) {
      let total = 0;
      for (const col of tableData[i].columns) {
        total += Number(col.val3);
      }
      const newTotalWeights = [...totalWeights];
      newTotalWeights[i] = total;
      setTotalWeights(newTotalWeights);
    }
    updateBgColor();
  }, [tableData]);

  const [classNames, setClassNames] = useState(['white', 'white', 'white']);

  function updateBgColor(){
    console.log('Total Weights:', totalWeights);
    console.log([tableData[0].weight, tableData[1].weight, tableData[2].weight])
    for (let i = 0; i < 3; i++) {
      if(totalWeights[i] > tableData[i].weight){
        const newClassNames = [...classNames];
        newClassNames[i] = 'red';
        setClassNames(newClassNames);
      }
      else if(totalWeights[i] == tableData[i].weight){
        const newClassNames = [...classNames];
        newClassNames[i] = 'green';
        setClassNames(newClassNames);
      }
      else{
        const newClassNames = [...classNames];
        newClassNames[i] = 'white';
        setClassNames(newClassNames);
      }
    }
  }

  const addColumn = () => {
    setTableData(tableData.map(row => ({ ...row, columns: [...row.columns, { val1: '', val2: '', val3: '' }] })));
  };

  const handleOrderChange = (event) => {
    const { value } = event.target;
    setOrder(value);
  };

  // Handle input change
  const handleInputChange = (rowIndex, colName, colIndex, valueIndex, event) => {
    const { value } = event.target;
    const newTableData = [...tableData];
    if(colName === 'weight'){
      newTableData[rowIndex].weight = Number(value);
    }
    else{
      newTableData[rowIndex][colName][colIndex][valueIndex] = value;
    }
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

  function encodeToCode128(text, codeABC = "B") {
    var startCode = String.fromCharCode(codeABC.toUpperCase().charCodeAt() + 138);
    var stop = String.fromCharCode(206);
    
    var check = checkSum128(text, startCode.charCodeAt(0) - 100);
  
    text = text.replace(" ", String.fromCharCode(194));
  
    return startCode + text + check + stop;
  }

  // Handle form submission
  const handleSubmit = (event) => {
    event.preventDefault();
    const doc = new jsPDF('portrait', 'in', 'a4');
    doc.setFont("msjh");
    doc.setLineWidth(0.005);
    const stickerHeight = 3.4; // inches
    const stickerWidth = 3.6; // inches
    const marginLeft = 0.5; // inches
    const marginTop = 0.5; // inches

    const positions = [
      { x: marginLeft, y: marginTop },
      { x: marginLeft + stickerWidth, y: marginTop },
      { x: marginLeft, y: marginTop + stickerHeight },
      { x: marginLeft + stickerWidth, y: marginTop + stickerHeight },
      { x: marginLeft, y: marginTop + 2 * stickerHeight },
      { x: marginLeft + stickerWidth, y: marginTop + 2 * stickerHeight }
    ];

    const base = 0.26;
    const offset = 0.23;

    positions.forEach(pos => {
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
      doc.text(tableData[0]['columns'][0].val1, pos.x + stickerWidth * 0.6, pos.y + base + offset * 5, 'center');
      doc.text("2024/05/05", pos.x + stickerWidth * 0.6, pos.y + base + offset * 8, 'center');
      doc.text("2025/05/05", pos.x + stickerWidth * 0.6, pos.y + base + offset * 9, 'center');
      doc.text("2桶", pos.x + stickerWidth * 0.6, pos.y + base + offset * 10, 'center');
      doc.text("1/14", pos.x + stickerWidth * 0.6, pos.y + base + offset * 11, 'center');
    });

    positions.forEach(pos => {
      doc.barcode('23092614-Z-120 SGZ', {
        fontSize: 26,
        textColor: "#000000",
        x: pos.x + stickerWidth / 2,
        y: pos.y + base + offset * 7,
        textOptions: { align: "center" } // optional text options
      });
    });
    doc.addPage();

    // 906Z
    // var i = 1;
    // for(const col of tableData[0].columns){
    //   //const barcode = encodeToCode128(col.val1);
    //   //doc.barcode(barcode, 50, 50);
    //   doc.barcode(col.val1, {
    //     fontSize: 50,
    //     textColor: "#000000",
    //     x: 2 * i,
    //     y: 2,
    //     textOptions: { align: "center" } // optional text options
    //   })
    //   doc.setFont("Courier"); // reset font to your font
    //   i++;
    // }

    doc.save("906Z.pdf");

    // 5299A
    doc = new jsPDF('portrait', 'in', 'a4');
    doc.setFont("msjh");
    doc.setLineWidth(0.005);

    positions.forEach(pos => {
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
      doc.text(tableData[0]['columns'][0].val1, pos.x + stickerWidth * 0.6, pos.y + base + offset * 5, 'center');
      doc.text("2024/05/05", pos.x + stickerWidth * 0.6, pos.y + base + offset * 8, 'center');
      doc.text("2025/05/05", pos.x + stickerWidth * 0.6, pos.y + base + offset * 9, 'center');
      doc.text("2桶", pos.x + stickerWidth * 0.6, pos.y + base + offset * 10, 'center');
      doc.text("1/14", pos.x + stickerWidth * 0.6, pos.y + base + offset * 11, 'center');
    });

    positions.forEach(pos => {
      doc.barcode('23092614-Z-120 SGZ', {
        fontSize: 26,
        textColor: "#000000",
        x: pos.x + stickerWidth / 2,
        y: pos.y + base + offset * 7,
        textOptions: { align: "center" } // optional text options
      });
    });

    doc.save("5299A.pdf");

    // 5299B
    doc = new jsPDF('portrait', 'in', 'a4');
    doc.setFont("msjh");
    doc.setLineWidth(0.005);
    doc.save("5299B.pdf");

    console.log('Submitted Table Data:', tableData, 'Order:', order);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
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
                value={row.weight}
                onChange={(event) => handleInputChange(rowIndex, 'weight', 0, '', event)}
                placeholder="重量"
              />
              {row.columns.map((col, colIndex) => (
                <td key={'col' + colIndex}>
                  
                    <input
                      type="text"
                      value={col.val1}
                      onChange={(event) => handleInputChange(rowIndex, 'columns', colIndex, 'val1', event)}
                      placeholder="Value 1"
                    /><br/>
                    <input
                      type="text"
                      value={col.val2}
                      onChange={(event) => handleInputChange(rowIndex, 'columns', colIndex, 'val2', event)}
                      placeholder="生產日期"
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
        </tbody>
      </table>
      <button onClick={addColumn}>Add Column</button>
      <button type="submit">Submit</button>
    </form>
  );
};

export default DataTable;