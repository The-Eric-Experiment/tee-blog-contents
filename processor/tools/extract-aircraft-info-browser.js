/**
 * Browser Console Script
 * Paste this into the browser console on a Planespotters.net aircraft details page
 * It will extract all information and copy the markdown to your clipboard
 */

(function() {
  // Extract registration from h1 title
  const h1 = document.querySelector('h1.headline-spacer');
  const fullTitle = h1 ? h1.textContent.trim() : '';
  const registrationMatch = fullTitle.match(/^([A-Z0-9-]+)/);
  const registration = registrationMatch ? registrationMatch[1] : '';
  
  // Extract details from main detail table
  const details = {};
  let aircraftType = '';
  const detailRows = document.querySelectorAll('.datatable.dt-outline.dt-bordered.dt-striped .dt-tr');
  
  detailRows.forEach((row) => {
    const label = row.querySelector('.dt-td:first-child')?.textContent?.trim().toLowerCase() || '';
    const valueCell = row.querySelector('.dt-td:last-child');
    
    if (label.includes('aircraft type')) {
      // Extract from the list item (skip the "Built as" item)
      const listItems = valueCell?.querySelectorAll('ul li');
      if (listItems && listItems.length > 1) {
        // Get the second li (the actual aircraft type, not "Built as")
        aircraftType = listItems[1]?.textContent.trim() || '';
      } else if (listItems && listItems.length === 1) {
        aircraftType = listItems[0]?.textContent.trim() || '';
      } else {
        // Fallback to h1 link
        const aircraftTypeLink = h1 ? h1.querySelector('a') : null;
        aircraftType = aircraftTypeLink ? aircraftTypeLink.textContent.trim() : '';
      }
    } else if (label.includes('serial number') || label.includes('msn')) {
      const span = valueCell?.querySelector('span[id]');
      details.msn = span ? span.textContent.trim() : valueCell?.textContent.trim() || '';
    } else if (label.includes('line number')) {
      const span = valueCell?.querySelector('span[id]');
      details.lineNumber = span ? span.textContent.trim() : valueCell?.textContent.trim() || '';
    } else if (label.includes('age')) {
      const ageSpan = valueCell?.querySelector('.text-bold');
      details.age = ageSpan ? ageSpan.textContent.trim() : valueCell?.textContent.trim() || '';
    } else if (label.includes('production site')) {
      // Get text after the flag icon
      const text = valueCell?.textContent.trim() || '';
      details.productionSite = text;
    } else if (label.includes('airframe status')) {
      const statusLi = valueCell?.querySelector('li');
      details.airframeStatus = statusLi ? statusLi.textContent.trim() : valueCell?.textContent.trim() || '';
    }
  });
  
  // Fallback: if aircraft type not found in detail table, try h1
  if (!aircraftType) {
    const aircraftTypeLink = h1 ? h1.querySelector('a') : null;
    aircraftType = aircraftTypeLink ? aircraftTypeLink.textContent.trim() : '';
  }
  
  // Extract operator history
  const operatorHistory = [];
  const operatorRows = document.querySelectorAll('.dt-outline.dt-striped.dt-highlight-active .dt-tr:not(:first-child)');
  
  operatorRows.forEach((row) => {
    const cells = row.querySelectorAll('.dt-td');
    // Check for both 8 and 9 columns (some tables have a fleet name column)
    if (cells.length >= 8) {
      const reg = cells[0]?.textContent.trim() || '';
      
      const aircraftTypeLink = cells[1]?.querySelector('a');
      const aircraftTypeOp = aircraftTypeLink ? aircraftTypeLink.textContent.trim() : cells[1]?.textContent.trim() || '';
      
      const airlineLink = cells[2]?.querySelector('a');
      const airline = airlineLink ? airlineLink.textContent.trim() : cells[2]?.textContent.trim() || '';
      
      const delivered = cells[3]?.textContent.trim() || '';
      const config = cells[4]?.textContent.trim() || '';
      const engines = cells[5]?.textContent.trim() || '';
      
      const hexCodeLink = cells[6]?.querySelector('a');
      const hexCode = hexCodeLink ? hexCodeLink.textContent.trim() : cells[6]?.textContent.trim() || '';
      
      // Extract aircraft name/fleet name (usually at index 7, between hex-code and remarks)
      let aircraftName = '';
      if (cells.length > 7 && !cells[7]?.classList.contains('dt-events')) {
        aircraftName = cells[7]?.textContent.trim() || '';
      }
      
      // Extract remarks - could be at index 7 or 8 depending on whether there's a fleet name column
      const remarks = [];
      let remarksCell = null;
      
      // Check if there's a dt-events class (remarks column)
      for (let i = 7; i < cells.length; i++) {
        if (cells[i]?.classList.contains('dt-events')) {
          remarksCell = cells[i];
          break;
        }
      }
      
      // Fallback: if no dt-events found, use the last cell
      if (!remarksCell && cells.length > 7) {
        remarksCell = cells[cells.length - 1];
      }
      
      if (remarksCell) {
        const remarksUl = remarksCell.querySelector('ul');
        if (remarksUl) {
          const remarkLis = remarksUl.querySelectorAll('li');
          remarkLis.forEach((li) => {
            // Replace abbr tags with their text content
            const remarkClone = li.cloneNode(true);
            const abbrs = remarkClone.querySelectorAll('abbr');
            abbrs.forEach(abbr => {
              const text = abbr.textContent.trim();
              abbr.replaceWith(document.createTextNode(text));
            });
            // Remove links but keep text
            const links = remarkClone.querySelectorAll('a');
            links.forEach(link => {
              const text = link.textContent.trim();
              link.replaceWith(document.createTextNode(text));
            });
            // Remove icon elements
            const icons = remarkClone.querySelectorAll('i');
            icons.forEach(icon => {
              icon.remove();
            });
            const remarkText = remarkClone.textContent.trim();
            if (remarkText) {
              remarks.push(remarkText);
            }
          });
        }
      }
      
      operatorHistory.push({
        reg: reg,
        'aircraft-type': aircraftTypeOp,
        airline: airline,
        delivered: delivered || null,
        config: config || null,
        engines: engines || null,
        'hex-code': hexCode || null,
        name: aircraftName || null,
        remarks: remarks.length > 0 ? remarks : null,
      });
    }
  });
  
  // Generate markdown
  let markdown = `---
data-from: www.planespotters.net
aircraft-type: ${aircraftType || ''}
age: ${details.age || ''}
production-site: ${details.productionSite || ''}
airframe-status: ${details.airframeStatus || ''}
operator-history:
`;
  
  operatorHistory.forEach((op) => {
    markdown += `  - reg: ${op.reg}\n`;
    markdown += `    aircraft-type: ${op['aircraft-type']}\n`;
    markdown += `    airline: ${op.airline}\n`;
    if (op.delivered) markdown += `    delivered: ${op.delivered}\n`;
    if (op.config) markdown += `    config: ${op.config}\n`;
    if (op.engines) markdown += `    engines: ${op.engines}\n`;
    if (op['hex-code']) markdown += `    hex-code: ${op['hex-code']}\n`;
    if (op.name) markdown += `    name: ${op.name}\n`;
    if (op.remarks && op.remarks.length > 0) {
      markdown += `    remarks:\n`;
      op.remarks.forEach((remark) => {
        // Escape quotes and special YAML characters
        const escapedRemark = remark.replace(/"/g, '\\"').replace(/\n/g, ' ');
        markdown += `      - "${escapedRemark}"\n`;
      });
    }
  });
  
  markdown += `---

[gallery]

title: (${registration}) ${aircraftType}

[/gallery]
`;
  
  // Copy to clipboard
  navigator.clipboard.writeText(markdown).then(() => {
    console.log('✓ Markdown copied to clipboard!');
    console.log('\n--- Extracted Data ---');
    console.log('Registration:', registration);
    console.log('Aircraft Type:', aircraftType);
    console.log('Age:', details.age);
    console.log('Production Site:', details.productionSite);
    console.log('Airframe Status:', details.airframeStatus);
    console.log('Operator History Entries:', operatorHistory.length);
    console.log('\n--- Markdown Preview ---');
    console.log(markdown);
  }).catch(err => {
    console.error('Failed to copy to clipboard:', err);
    console.log('\n--- Markdown ---');
    console.log(markdown);
  });
})();
