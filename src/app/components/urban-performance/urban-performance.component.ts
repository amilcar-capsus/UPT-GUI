import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NodeService } from 'src/app/services/node/NodeService';
import { TreeNode, MessageService, SelectItem, DynamicDialogRef, DynamicDialogConfig } from 'primeng/api';
import { ListService } from 'src/app/services/list/list.service';
import { Column } from 'src/app/domain/column';
import { Layer } from 'src/app/interfaces/layer';
import { Indicator } from 'src/app/interfaces/indicator';
import { Scenario } from 'src/app/interfaces/scenario';
import { ScenarioService } from 'src/app/services/scenario/scenario.service';
import { Scenarios } from 'src/app/interfaces/results';
import { ResultsService } from 'src/app/services/results/results.service';
import { LayerService } from 'src/app/services/layer/layer.service';
import { DataCopy } from 'src/app/interfaces/data-copy';
import { DataCopyService } from 'src/app/services/data-copy/data-copy.service';
import { StatusService } from '../../services/status.service';
import { Assumption } from 'src/app/interfaces/assumption';
import { AssumptionService } from 'src/app/services/assumption/assumption.service';
import { ModuleService } from 'src/app/services/module/module.service';
import { Amenities } from 'src/app/interfaces/amenities';
import { UpMiscService } from 'src/app/services/up-misc/up-misc.service';
import { UpColumn } from 'src/app/interfaces/up-column';
import { IndResult } from 'src/app/interfaces/ind-result';
import { IndUp } from 'src/app/interfaces/ind-up';
import { Module } from 'src/app/interfaces/module';
import { NgbTabset } from '@ng-bootstrap/ng-bootstrap';
import { Classification } from 'src/app/interfaces/classification';
import { ClassificationService } from 'src/app/services/classification/classification.service';
import { Status } from 'src/app/interfaces/status';
import { saveAs } from 'file-saver';

declare var Oskari: any;

@Component({
  selector: 'app-urban-performance',
  templateUrl: './urban-performance.component.html',
  styleUrls: ['./urban-performance.component.css'],
  providers: [MessageService],
})
export class UrbanPerformanceComponent implements OnInit {
  /**
   * UP Variables
   */
   @Output() logErrorHandler: EventEmitter<string> = new EventEmitter();
   @Output() blockDocument: EventEmitter<any> = new EventEmitter();
   @Output() unblockDocument: EventEmitter<any> = new EventEmitter();
   @Output() clearEvaluation: EventEmitter<any> = new EventEmitter();
   @Output() showEvaluation: EventEmitter<any> = new EventEmitter();
   @Output() hideEvaluation: EventEmitter<any> = new EventEmitter();
   @Input() evalHtml: string;
   @Output() evalHtmlChange: EventEmitter<string> = new EventEmitter();
   @Input() Oskari: any;
   @Input() isAdmin: boolean;

  columnDataGP: string[] = [];

   @ViewChild('tabsetUP', { static: false }) tabsetUP: NgbTabset;
   // Data and options used for chart in UP
   dataColorsUP: string[] = ['#FF8680', '#43D9B7', '#4287F5', '#FCBA03'];

   // Status
   statusUP: Status[] = [];
   buffersUP = [];

   // Collapsed state of UP steps
   createScenarioCollapsed = true;
   manageDataCollapsed = true;
   scenariosCollapsed = true;
   resultsCollapsed = true;

   // Status of UP steps
   createScenarioDone = false;
   manageDataDone = false;
   scenariosDone = false;
   resultsDone = false;

   // Create scenario properties
   isBaseUP = false;

   // Properties to display UP dialogs
   displayUP = false;
   displayManageDataUP = false;
   displayAdvancedUP = false;
   editAssumptions = false;
   editScenario = false;
   editClassification = false;
   editModule = false;
   editIndicator = false;
   editIndResult = false;

   // Data provided by NodeService UP
   layersUP: TreeNode[];
   layers: TreeNode[];
   tablesUP: TreeNode[];
   selectedTable: TreeNode;
   selectedLayerUP: TreeNode;
   selectedLayer: TreeNode;

   // Cities
   studyArea: SelectItem[];
   selectedStudyAreaUP: Layer;

   // Properties to change icons of collapsible UP steps
   showCreate: boolean;
   showManage: boolean;
   showResults: boolean;
   showScenariosUP: boolean;

   // Data provided by ListService UP
   listManageDataUP: any[];
   listDataUP: UpColumn[];
   selectedColumn: Column;
   selectedUPColumn: Column;

   // Indicators
   indicators: Indicator[];
   indSelectItems: SelectItem[] = [];
   selectedIndicators: Indicator[];
   indArray;
   selIndText = '';

   selectedCityAssumptions: Layer;

   // Scenarios
   newScenario: Scenario;
   scenarios: Scenario[];
   scenarioManage: Scenario;
   scenarioAssumptions: Scenario;
   selectedScenarios: Scenario[] = [];
   scenarioName: string;
   scenarioLocation: string;
   scenariosCalculate: number[] = [];
   selScenIdArray = [];
   isNewScenario: boolean;
   selScenario: Scenario;

   // Assumptions
   assumptionName: string;
   assumptionCategory: string;
   assumptionValue: number;

   // Results
   scenarioResults: any[] = [];
   rsltLabels: any[] = [];
   rsltLabelsArray: any[] = [];
   rsltLabelsPercent: any[] = [];
   rsltUnits: any[] = [];
   rsltValues: any[] = [];
   rsltValuesPercent: any[] = [];
   resultDatasets: any[] = [];
   resultDataUP: any;
   resultOptionsUP: any;

   goalsArray: any[] = [];
   goalsLabelArray: any[] = [];
   goalsValues: any[] = [];

   // Results
   resultsScenarios: Scenarios[];

   // Assumptions
   uploadedAssumptions: any[] = [];
   asmptStudyAreaFile: Layer;
   asmptScenarioManage: Scenario;
   assumptions: Assumption[];
   selAssumption: Assumption;
   isNewAssumption: boolean;
   assumptionManage: Assumption;

   // Classification
   isNewClassification = false;
   manageClassification: Classification;
   selClassification: Classification;
   classifications: Classification[] = [];

   // UP Tables
   upTablesScenario: Scenario;

   // Modules
   isNewModule = false;
   manageModules: Module;
   selModule: Module;
   modules: Module[] = [];

   // Indicator
   isNewIndicator = false;
   manageIndicators: IndUp;
   selIndicator: IndUp;
   inds: IndUp[] = [];

   // Indicator Results
   isNewIndResult = false;
   indsEditResult: SelectItem[] = [];
   manageIndResults: IndResult;
   selIndResult: IndResult;
   indsResult: IndResult[] = [];

   // Amenities
   isNewAmenities = false;
   manageAmenities: Amenities;
   selAmenities: Amenities;
   amenities: Amenities[] = [];

   // Roads
   isNewRoads = false;
   manageRoads: Amenities;
   selRoads: Amenities;
   roads: Amenities[] = [];

   // Transit
   isNewTransit = false;
   manageTransit: Amenities;
   selTransit: Amenities;
   transit: Amenities[] = [];

   // Risks
   isNewRisks = false;
   manageRisks: Amenities;
   selRisks: Amenities;
   risks: Amenities[] = [];

   // Footprints
   isNewFootprints = false;
   manageFootprints: Amenities;
   selFootprints: Amenities;
   footprints: Amenities[] = [];

   // Jobs
   isNewJobs = false;
   manageJobs: Amenities;
   selJobs: Amenities;
   jobs: Amenities[] = [];

   // Manage Data UP variables
   manageDataHeaderUP = '';
   columnsHeaderUP = '';
   columnFieldsArrayUP: Column[] = [];
   colFieldsNameArrayUP: any[] = [];

   // import data
   dataCopy: DataCopy;

   // Manage variables for objects
   manageScenario: Scenario;

   // Download object
   downloadObject: any;

   // selScenarios copy
   scenariosCopy: Scenario[];

   okayResults = true;

   // Cols for managing objects
   colsScenario: any[];
   colsAssumption: any[];
   colsClassification: any[];
   colsResults: any[] = [];
   colsModules: any[];
   colsIndicators: any[];
   colsIndResults: any[];

   /**
   *Functions for UP
   */
  startUP() {
    this.indSelectItems = [];
    this.indsEditResult = [];
    this.selectedScenarios = [];
    this.moduleService.getModules().subscribe(
      (indicators) => {
        this.indicators = indicators;
        if (this.isAdmin) {
          this.modules = indicators;
        }
      },
      (error) => {
        this.showErrorHandler(error);
      },
      () => {
        this.indicators.forEach((indicator) => {
          this.indSelectItems.push({
            label: indicator.label,
            value: indicator,
          });
        });
      }
    );
    this.layersService.getStudyAreas().subscribe(
      (studyArea) => {
        this.studyArea = studyArea;
      },
      (error) => {
        this.showErrorHandler(error);
      }
    );
    this.classificationService.getClassifications().subscribe(
      (clsf) => (this.classifications = clsf),
      (error) => {
        this.showErrorHandler(error);
      }
    );
    this.getScenarios();
    if (this.isAdmin) {
      this.moduleService.getIndicators().subscribe(
        (inds) => {
          this.inds = inds;
          inds.forEach((ind) =>
            this.indsEditResult.push({ value: ind.id, label: ind.indicator })
          );
        },
        (error) => {
          this.showErrorHandler(error);
        }
      );
      this.moduleService.getIndicatorResults().subscribe(
        (indRes) => (this.indsResult = indRes),
        (error) => {
          this.showErrorHandler(error);
        }
      );
    }
    this.displayUP = true;
  }
  // Displays the main UP window without sending requests again.
  showNoLoadUP() {
    this.displayUP = true;
  }

  // Hides main UP window
  hideUP() {
    this.displayUP = false;
  }

  // Displays the Manage Data dialog for UP
  showManageDataUP() {
    this.displayManageDataUP = true;
  }

  // Displays the Advanced dialog for UP
  showAdvancedUP() {
    this.displayAdvancedUP = true;
  }

  // Hides the Advanced dialog for UP
  hideAdvancedUP() {
    this.displayAdvancedUP = false;
  }

  // Hides the Manage Data dialog for UP
  hideManageDataUP() {
    this.displayManageDataUP = false;
  }

  // Collapses the Create Scenario section of the main UP dialog
  collapseCreateScenario() {
    this.createScenarioCollapsed = true;
  }

  // Collapses the Manage Data section of the main UP dialog
  collapseManageData() {
    this.manageDataCollapsed = true;
  }

  // Collapses the Scenarios section of the main UP dialog
  collapseScenarios() {
    this.scenariosCollapsed = true;
  }

  // Collapses the Results section of the main UP dialog
  collapseUPResults() {
    this.resultsCollapsed = true;
  }

  // Opens the Create Scenario section of the main UP dialog
  openCreateScenario() {
    this.createScenarioCollapsed = false;
  }

  // Opens the Manage Data section of the main UP dialog
  openManageData() {
    this.manageDataCollapsed = false;
  }

  // Opens the Scenarios section of the main UP dialog
  openScenarios() {
    this.scenariosCollapsed = false;
  }

  // Opens the Results section of the main UP dialog
  openUPResults() {
    this.resultsCollapsed = false;
  }

  // Marks the Create Scenario as completed when the create request is successfully done
  finishCreateScenario() {
    this.createScenarioDone = true;
  }

  finishManageData() {
    this.manageDataDone = true;
  }

  finishScenarios() {
    this.scenariosDone = true;
  }

  // Automatically marks indicator dependencies if an indicator with dependencies is selected
  changeIndicator(event) {
    const indAry = event.value;
    if (indAry.length > 0) {
      const indSel = event.itemValue;
      const indDep = indSel.dependencies;
      const indList = this.indSelectItems;
      let origString = '';
      let arrayString: string[] = [];
      const newArrayString: string[] = [];
      const depAry = [];
      origString = indDep.replace(/"/g, '').replace('[', '').replace(']', '');
      arrayString = origString.split(',');
      arrayString.forEach((str) => {
        newArrayString.push(str.trim());
      });
      newArrayString.forEach((ary) => {
        indList.forEach((ind) => {
          if (ind.value.name.toLowerCase() === ary.toLowerCase()) {
            depAry.push(ind.value);
          }
        });
      });
      depAry.forEach((dep) => {
        if (!indAry.includes(dep)) {
          event.value.push(dep);
        }
      });
    }
  }

  // Sends a request for results from the UP calculator and formats them for the Results section of UP.
  getUPResults() {
    if (this.selectedScenarios.length > 0) {
      this.scenariosCopy = this.selectedScenarios;
      this.okayResults = true;
      this.resultsService.getScenarios(this.selectedScenarios).subscribe(
        (scnr) => {
          this.scenarioResults = scnr;
        },
        (error) => {
          this.showErrorHandler(error);
        },
        () => {
          this.scenarioResults.forEach((rslt) => {
            if (rslt.results.length > 0) {
              this.okayResults = false;
            }
          });
          this.rsltLabels = [];
          this.rsltLabelsArray = [];
          this.rsltLabelsPercent = [];
          this.rsltUnits = [];
          this.rsltValues = [];
          this.rsltValuesPercent = [];
          this.resultDatasets = [];

          this.goalsArray = [];
          this.goalsLabelArray = [];
          this.goalsValues = [];

          const fullRslt = [];
          const rslVal = [];
          let tmpRslt = [];
          let tempVal = [];
          const rslInd = [];
          const scnName = [];
          const rsltArray = [];
          let prcVal = [];
          let goalInd = [];
          let goalIndArray = [];
          const goalLabel = [];
          let goalScenario = [];
          let goalValArray = [];
          this.scenarioResults[0].results.forEach((r) => {
            if (!this.rsltLabelsArray.includes(r.label) && r.label !== null) {
              this.rsltLabels.push({
                label: r.label,
                units: r.units,
                value: [],
              });
              this.rsltLabelsArray.push(r.label);
            }
            if ((r.units === '%' || !r.units) && r.label) {
              this.rsltLabelsPercent.push(r.label);
            }
            if (r.category !== '' && r.category !== null) {
              if (!this.goalsLabelArray.includes(r.category)) {
                this.goalsLabelArray.push(r.category);
                this.goalsArray.push({ name: r.category, goal: [] });
              }
            }
          });
          this.rsltLabelsPercent = this.rsltLabelsPercent.sort();
          this.rsltLabels.forEach((label) => {
            tmpRslt = [];
            this.scenarioResults.forEach((scenario) => {
              scenario.results.forEach((result) => {
                if (result.label === label.label) {
                  tmpRslt.push(result.value);
                }
              });
            });
            label.value.push(tmpRslt);
          });
          this.goalsArray.forEach((goal, i) => {
            goalInd = [];
            goalIndArray = [];
            this.scenarioResults.forEach((scenario) => {
              scenario.results.forEach((result) => {
                if (result.category === goal.name) {
                  if (!goalInd.includes(result.label) && result.label) {
                    goalInd.push(result.label);
                    goalIndArray.push({
                      name: result.label,
                      units: result.units,
                      goal: goal.name,
                    });
                  }
                }
              });
            });
            goalLabel.push(goalIndArray);
          });
          this.goalsArray.forEach((goal, i) => {
            goalLabel.forEach((g, index) => {
              g.forEach((lbl) => {
                if (goal.name === lbl.goal) {
                  goal.goal.push({
                    indicator: lbl.name,
                    units: lbl.units,
                    value: [],
                  });
                }
              });
            });
          });
          this.goalsArray.forEach((goal) => {
            goalScenario = [];
            goalValArray = [];
            if (goal.goal.length > 0) {
              goal.goal.forEach((indicator) => {
                this.scenarioResults.forEach((scenario) => {
                  scenario.results.forEach((result) => {
                    if (
                      result.label === indicator.indicator &&
                      result.category === goal.name
                    ) {
                      indicator.value.push(result.value);
                    }
                  });
                });
              });
            } else {
              const tempGoal = this.goalsArray.filter((ind) => ind !== goal);
              this.goalsArray = tempGoal;
            }
          });
          this.scenarioResults.forEach((r) => {
            fullRslt.push(r.results);
          });
          fullRslt.forEach((r, index) => {
            tempVal = [];
            prcVal = [];
            let valPrct = [];
            r.forEach((i) => {
              this.rsltLabelsPercent.forEach((lbl) => {
                if (i.label === lbl) {
                  prcVal.push({ label: i.label, value: i.value });
                  prcVal = prcVal.sort(this.compareLabels);
                  tempVal.push(i.value);
                }
                rsltArray.push(i);
              });
            });
            rslVal.push(tempVal);
            prcVal.forEach((val) => {
              valPrct.push(val.value);
            });
            this.rsltValuesPercent.push(valPrct);
          });
          this.rsltValues = rslVal;
          this.rsltLabels.forEach((r) => {
            rslInd.push(r.label);
          });
          this.scenarioResults.forEach((scn) => scnName.push(scn.name));
          for (let i = 0; i < scnName.length; i++) {
            this.resultDatasets.push({
              label: scnName[i],
              backgroundColor: 'transparent',
              borderColor: this.dataColorsUP[i],
              pointBackgroundColor: this.dataColorsUP[i],
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: this.dataColorsUP[i],
              data: this.rsltValuesPercent[i],
            });
          }
          this.resultDataUP = {
            labels: this.rsltLabelsPercent,
            datasets: this.resultDatasets,
          };
          this.collapseScenarios();
          this.openUPResults();
        }
      );
    }
  }

  // Sends a request for the results in a CSV format.
  exportUPResults() {
    this.resultsService.exportUPResults(this.scenariosCopy).subscribe(
      (res) => {
        this.downloadObject = res;
      },
      (error) => {
        this.showErrorHandler(error);
      },
      () => {
        this.saveToFileSystem(this.downloadObject);
      }
    );
  }

  // Formats the results from the exportUPResults method into a .CSV file.
  private saveToFileSystem(response) {
    const blob = new Blob([response], { type: 'text/csv' });
    saveAs(blob, 'up-results.csv');
  }

  // Compares labels to make it easier to sort them.
  compareLabels(a, b) {
    if (a.label < b.label) {
      return -1;
    }
    if (a.label > b.label) {
      return 1;
    }
    return 0;
  }

  // Sends a request to evaluate the Scenarios selected in the MultiSelect element
  calculateScenarios() {
    if (this.selectedScenarios.length > 0) {
      let interval;
      this.clearResultsConsole();
      this.messageService.add({
        severity: 'info',
        summary: 'In Progress!',
        detail: 'Your operation is being processed.',
      });
      this.okayResults = true;
      this.resultsService.calculateScenarios(this.selectedScenarios).subscribe(
        () => {},
        (error) => {
          this.showErrorHandler(error);
        },
        () => {
          interval = setInterval(() => this.getStatusUP(interval), 5000);
        }
      );
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'No scenarios selected!',
        detail: 'Please choose at least one scenario and try again.',
      });
    }
  }

  // Sends a request to get the latest status of the UP evaluation. If completed, calls getUPBuffers and getUPResults.
  getStatusUP(i) {
    let statusFlag = false;
    this.statusService.statusUP(this.selectedScenarios).subscribe(
      (sts) => {
        this.statusUP = sts;
      },
      () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error!',
          detail: 'An error ocurred during the operation!',
        });
      },
      () => {
        if (this.statusUP.length > 0) {
          this.clearResultsConsole();
          this.showResultsConsole();
          this.statusUP.forEach((s) => {
            this.evalHtml +=
              '<div class="ui-md-4">' +
              s.event +
              '</div><div class="ui-md-2">' +
              s.scenario_id +
              '</div><div class="ui-md-2">' +
              s.created_on +
              '</div><div class="ui-md-4">' +
              s.value +
              '</div>';
            if (s.value.toLowerCase() === 'all scenarios have been processed') {
              statusFlag = true;
            }
          });
          if (statusFlag) {
            clearInterval(i);
            this.messageService.add({
              severity: 'success',
              summary: 'Success!',
              detail: 'Results successfully generated.',
            });
            this.getUPBuffers();
            this.getUPResults();
          }
        }
      }
    );
  }

  // Sends a request for buffers generated from Buffers modules and saves them into Oskari.
  getUPBuffers() {
    this.resultsService.getUPBuffers(this.selectedScenarios).subscribe(
      (buffers) => (this.buffersUP = buffers),
      (error) => {
        this.showErrorHandler(error);
      },
      () => {
        this.buffersUP.forEach((bfs) => {
          setTimeout(() => {
            Oskari.getSandbox()
              .findRegisteredModuleInstance('MyPlacesImport')
              .getService()
              .addLayerToService(bfs, false);
            Oskari.getSandbox()
              .findRegisteredModuleInstance('MyPlacesImport')
              .getTab()
              .refresh();
          }, 500);
        });
        this.layersService.getStudyAreas().subscribe(
          (studyArea) => {
            this.studyArea = studyArea;
          },
          (error) => {
            this.showErrorHandler(error);
          }
        );
      }
    );
  }

  // Sends a request to create a Scenario with the Create Scenario form
  createScenario() {
    if (this.selectedStudyAreaUP === null) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error!',
        detail: 'Please select a study area!',
      });
    } else if (this.scenarioName === null) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error!',
        detail: 'Please type a name for your scenario!',
      });
    } else if (this.indSelectItems.length === 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error!',
        detail: 'Please select at least one indicator!',
      });
    } else if (
      this.selectedStudyAreaUP !== null &&
      this.scenarioName !== null &&
      this.indSelectItems.length > 0
    ) {
      this.block();
      this.messageService.add({
        severity: 'info',
        summary: 'In Progress!',
        detail: 'Your operation is being processed.',
      });
      this.selIndText = '';
      this.selectedIndicators.forEach(
        (indicator) =>
          (this.selIndText = this.selIndText + indicator.name + '_')
      );
      this.selIndText = this.selIndText.slice(0, -1);
      this.newScenario = {
        name: this.scenarioName,
        indicators: this.selIndText,
        isBase: this.isBaseUP ? 1 : 0,
        studyArea: this.selectedStudyAreaUP.id,
        studyAreaId: this.selectedStudyAreaUP.id,
      };
      this.scenarioService.postScenario(this.newScenario).subscribe(
        (scenario) => {
          if (!scenario.name.toLowerCase().includes('error')) {
            this.newScenario = null;
            this.newScenario = {
              scenarioId: scenario.scenarioId,
              name: scenario.name,
              indicators: scenario.indicators,
              isBase: scenario.isBase,
              studyArea: scenario.studyArea,
              studyAreaId: scenario.studyAreaId,
            };
            this.getScenarios();
            this.messageService.add({
              severity: 'success',
              summary: 'Success!',
              detail: 'Scenario created successfully.',
            });
            this.unblock();
            if (scenario.has_assumptions === 0) {
              this.messageService.clear();
              this.messageService.add({
                key: 'loadAssumptions',
                sticky: true,
                severity: 'warn',
                summary: 'Warning!',
                detail:
                  'Your scenario belongs to a study area that lacks assumptions, which are required in order to use ' +
                  'it for calculations. You can upload or create assumptions in the Assumptions tab under the Advanced Options ' +
                  'module. Click \'YES \' to open the module, or click \'NO\' to do this later.',
              });
            }
            this.collapseCreateScenario();
            this.finishCreateScenario();
            this.openManageData();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error!',
              detail: 'An error ocurred during the operation.',
            });
            this.unblock();
          }
        },
        (error) => {
          this.unblock();
          this.showErrorHandler(error);
        },
        () => {
          this.selectedScenarios = [];
        }
      );
    }
  }

  // Opens the Advanced dialog on the Assumptions tab
  acceptLoadAssumption() {
    this.messageService.clear('loadAssumptions');
    this.asmptStudyAreaFile = this.selectedStudyAreaUP;
    this.tabsetUP.select('assumptionsUP');
    this.showAdvancedUP();
  }

  // Closes the loadAssumptions message
  cancelLoadAssumptions() {
    this.messageService.clear('loadAssumptions');
  }

  // Loads the PrimeNG tree element in the Manage Data section of the main UP dialog using the Scenario ID
  loadUPLayers() {
    if (this.scenarioManage) {
      this.nodeService
        .getUPLayers(this.scenarioManage.scenarioId)
        .then((layersUP) => {
          this.layersUP = layersUP;
        });
    }
  }

  // Loads the study for UP
  loadDataLayerUP() {
    this.nodeService.getLayers().then((layers) => {
      this.layers = layers;
      this.showManageDataUP();
    });
  }

  // Loads the required column names after selecting a table in Manage Data section.
  loadUPColumns(event) {
    if (event.node.type.toLowerCase() === 'layer') {
      if (event.node.data.toLowerCase() !== 'assumptions') {
        this.listService.getUPColumn(event.node.data).subscribe(
          (listDataUP) => {
            this.listDataUP = listDataUP;
            this.loadDataLayerUP();
          },
          (error) => {
            this.showErrorHandler(error);
          }
        );
      }
      // If the table is 'assumptions', displays the Advanced dialog on the Assumptions tab.
      else {
        this.tabsetUP.select('assumptionsUP');
        this.showAdvancedUP();
      }
    }
  }

  // Loads the options for the dropdowns in the UP Manage Data dialog using the layer ID.
  loadDataColumnsUP(event) {
    if (event.node.type.toLowerCase() === 'layer') {
      this.listService.getColumn(event.node.data).subscribe(
        (listManageDataUP) => {
          this.colFieldsNameArrayUP = [];
          listManageDataUP.forEach((data) =>
            this.colFieldsNameArrayUP.push({ name: data })
          );
          this.listManageDataUP = this.colFieldsNameArrayUP;
          this.columnsHeaderUP = event.node.label;
        },
        (error) => {
          this.showErrorHandler(error);
        }
      );
    }
  }

  // Loads the PrimeNG tree element in the Advanced dialog on the Clear Tables tab
  loadTablesUP() {
    if (this.upTablesScenario) {
      this.nodeService.getUPTables(this.upTablesScenario.scenarioId).subscribe(
        (tables) => (this.tablesUP = tables),
        (error) => {
          this.showErrorHandler(error);
        }
      );
    }
  }

  // Shows the confirmDeleteTableUP message
  deleteTableUP(event) {
    this.messageService.add({
      key: 'confirmDeleteTableUP',
      sticky: true,
      severity: 'warn',
      summary: 'Warning!',
      detail:
        'This operation will delete all data from the selected table. This process is irreversible. ' +
        'Confirm to delete, cancel to go back',
    });
  }

  // Sends a request to clear the selected table from its data
  confirmDeleteTableUP() {
    this.messageService.add({
      severity: 'info',
      summary: 'In process!',
      detail: 'Table data is being deleted!',
    });
    this.messageService.clear('confirmDeleteTableUP');
    this.upMiscService
      .deleteTableUP(this.upTablesScenario.scenarioId, this.selectedTable.data)
      .subscribe(
        () => {},
        (error) => {
          this.showErrorHandler(error);
        },
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success!',
            detail: 'Table data deleted successfully!',
          });
          this.loadTablesUP();
          this.loadUPLayers();
        }
      );
  }

  // Hides the confirmDeleteTableUP message
  cancelDeleteTableUP() {
    this.messageService.clear('confirmDeleteTableUP');
  }

  // Sends a request to import data through the UP Manage Data dialog
  importDataUP() {
    this.block();
    this.messageService.add({
      severity: 'info',
      summary: 'In Progress!',
      detail: 'Your operation is being processed.',
    });
    this.columnDataGP = [];
    this.columnFieldsArrayUP.forEach((data) =>
      this.columnDataGP.push(data.name)
    );
    this.dataCopy = {
      layerName: this.selectedLayer.data,
      layerUPName: this.selectedLayerUP.data,
      table: this.columnDataGP,
      tableUP: this.listDataUP,
      scenarioId: this.scenarioManage.scenarioId,
    };
    this.dataCopyService.copyDataUP(this.dataCopy).subscribe(
      () => {},
      (error) => {
        this.unblock();
        this.showErrorHandler(error);
      },
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success!',
          detail: 'Process completed successfully.',
        });
        this.loadUPLayers();
        this.classificationService.getClassifications().subscribe(
          (clsf) => (this.classifications = clsf),
          (error) => {
            this.showErrorHandler(error);
          }
        );
        this.unblock();
        this.columnFieldsArrayUP = [];
        this.hideManageDataUP();
      }
    );
    this.columnFieldsArrayUP = [];
  }

  // Sends a request to get the list of Scenarios
  getScenarios() {
    this.scenarioService.getScenarios().subscribe(
      (scenarios) => (this.scenarios = scenarios),
      (error) => {
        this.showErrorHandler(error);
      }
    );
  }

  // Shows the Scenario Details and tags the Scenario as not new
  selectScenario(event) {
    this.isNewScenario = false;
    this.scenarioManage = this.cloneScenario(event.data);
    this.editScenario = true;
  }

  // Creates a copy of the selected Scenario
  cloneScenario(s: Scenario): Scenario {
    let scen = {};
    for (let prop in s) {
      scen[prop] = s[prop];
    }
    return scen as Scenario;
  }

  // Sends a request to update the Scenario
  updateScenario() {
    this.scenarioService.putScenario(this.scenarioManage).subscribe(
      () => {
        this.messageService.add({
          severity: 'info',
          summary: 'In process!',
          detail: 'Your scenario is being updated!',
        });
      },
      (error) => {
        this.showErrorHandler(error);
      },
      () => {
        this.scenarioService.getScenarios().subscribe(
          (scenarios) => (this.scenarios = scenarios),
          (error) => {
            this.showErrorHandler(error);
          }
        );
        this.selectedScenarios = [];
        this.scenarioManage = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Success!',
          detail: 'Scenario updated successfully!',
        });
        this.hideEditScenario();
      }
    );
  }

  // Hides the Scenario Details dialog
  hideEditScenario() {
    this.editScenario = false;
  }

  // Shows the confirmDeleteScenario message
  deleteScenario() {
    this.messageService.clear();
    this.messageService.add({
      key: 'confirmDeleteScenario',
      sticky: true,
      severity: 'warn',
      summary: 'Warning!',
      detail:
        'This operation is irreversible. Confirm to delete, or cancel to go back.',
    });
  }

  // Sends a request to delete the selected Scenario
  confirmDeleteScenario() {
    this.scenarioService.deleteScenario(this.scenarioManage).subscribe(
      () => {
        this.messageService.add({
          severity: 'info',
          summary: 'In process!',
          detail: 'Your scenario is being deleted!',
        });
      },
      (error) => {
        this.showErrorHandler(error);
      },
      () => {
        this.scenarioService.getScenarios().subscribe(
          (scenarios) => (this.scenarios = scenarios),
          (error) => {
            this.showErrorHandler(error);
          }
        );
        this.layers = [];
        this.tablesUP = [];
        this.selectedScenarios = [];
        this.messageService.clear('confirmDeleteScenario');
        this.messageService.add({
          severity: 'success',
          summary: 'Success!',
          detail: 'Scenario deleted successfully!',
        });
        this.hideEditScenario();
      }
    );
  }

  // Closes the confirmDeleteScenario message
  cancelDeleteScenario() {
    this.messageService.clear('confirmDeleteScenario');
  }

  // Sends a request to get the Assumptions related to the selected Scenario
  loadAssumptions() {
    if (this.asmptScenarioManage) {
      this.assumptionService
        .getAssumptions(this.asmptScenarioManage.scenarioId)
        .subscribe(
          (assumptions) => (this.assumptions = assumptions),
          (error) => {
            this.showErrorHandler(error);
          }
        );
    }
  }

  // Sends a request to upload an assumptions file
  uploadAssumption(event) {
    this.block();
    this.messageService.add({
      severity: 'info',
      summary: 'In process!',
      detail: 'Your file is being uploaded!',
    });
    this.assumptionService
      .uploadAssumption(this.asmptStudyAreaFile.id, event.files[0])
      .subscribe(
        () => {},
        (error) => {
          this.unblock();
          this.showErrorHandler(error);
        },
        () => {
          if (this.asmptScenarioManage) {
            this.assumptionService
              .getAssumptions(this.asmptScenarioManage.scenarioId)
              .subscribe(
                (asmpt) => (this.assumptions = asmpt),
                (error) => {
                  this.showErrorHandler(error);
                }
              );
          }
          this.messageService.add({
            severity: 'success',
            summary: 'Success!',
            detail: 'File uploaded successfully!!',
          });
          this.unblock();
        }
      );
  }

  // Shows the Assumption Detail dialog and tags the selected assumption as not new
  selectAssumption(event) {
    this.isNewAssumption = false;
    this.assumptionManage = this.cloneAssumption(event.data);
    this.editAssumptions = true;
  }

  // Shows the Assumption Detail dialog and tags the selected assumption as new
  addAssumption() {
    this.isNewAssumption = true;
    this.assumptionManage = {} as Assumption;
    this.editAssumptions = true;
  }

  // Sends a request to either save or update an assumption, depending on its tag
  saveAssumption() {
    if (this.isNewAssumption) {
      this.assumptionService.createAssumption(this.assumptionManage).subscribe(
        () =>
          this.messageService.add({
            severity: 'info',
            summary: 'In process!',
            detail: 'Your assumption is being created!',
          }),
        (error) => {
          this.showErrorHandler(error);
        },
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success!',
            detail: 'Assumption created successfully!',
          });
          if (this.asmptScenarioManage) {
            this.assumptionService
              .getAssumptions(this.asmptScenarioManage.scenarioId)
              .subscribe(
                (asmpt) => (this.assumptions = asmpt),
                (error) => {
                  this.showErrorHandler(error);
                }
              );
          }
          this.assumptionManage = null;
          this.editAssumptions = false;
        }
      );
    } else {
      this.assumptionService.updateAssumption(this.assumptionManage).subscribe(
        () =>
          this.messageService.add({
            severity: 'info',
            summary: 'In process!',
            detail: 'Your assumption is being updated!',
          }),
        (error) => {
          this.showErrorHandler(error);
        },
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success!',
            detail: 'Assumption updated successfully!',
          });
          if (this.asmptScenarioManage) {
            this.assumptionService
              .getAssumptions(this.asmptScenarioManage.scenarioId)
              .subscribe(
                (asmpt) => (this.assumptions = asmpt),
                (error) => {
                  this.showErrorHandler(error);
                }
              );
          }
          this.assumptionManage = null;
          this.editAssumptions = false;
        }
      );
    }
  }

  // Creates a copy of the selected assumption
  cloneAssumption(a: Assumption): Assumption {
    let asmpt = {};
    for (let prop in a) {
      asmpt[prop] = a[prop];
    }
    return asmpt as Assumption;
  }

  // Shows the confirmDeleteAssumption message
  deleteAssumption() {
    this.messageService.clear();
    this.messageService.add({
      key: 'confirmDeleteAssumption',
      sticky: true,
      severity: 'warn',
      summary: 'Warning!',
      detail:
        'This operation is irreversible. Confirm to delete, or cancel to go back.',
    });
  }

  // Sends a request to delete an assumption
  confirmDeleteAssumption() {
    this.assumptionService.deleteAssumption(this.assumptionManage).subscribe(
      () =>
        this.messageService.add({
          severity: 'info',
          summary: 'In process!',
          detail: 'Your assumption is being deleted!',
        }),
      (error) => {
        this.showErrorHandler(error);
      },
      () => {
        if (this.asmptScenarioManage) {
          this.assumptionService
            .getAssumptions(this.asmptScenarioManage.scenarioId)
            .subscribe(
              (asmpt) => (this.assumptions = asmpt),
              (error) => {
                this.showErrorHandler(error);
              }
            );
        }
        this.assumptionManage = null;
        this.messageService.clear('confirmDeleteAssumption');
        this.messageService.add({
          severity: 'success',
          summary: 'Success!',
          detail: 'Assumption deleted successfully!',
        });
        this.editAssumptions = false;
      }
    );
  }

  // Closes the cancelDeleteAssumption
  cancelDeleteAssumption() {
    this.messageService.clear('confirmDeleteAssumption');
  }

  // Shows the Classification Details dialog and tags the classification as not new.
  selectClassification(event) {
    this.isNewClassification = false;
    this.manageClassification = this.cloneClassification(event.data);
    this.editClassification = true;
  }

  // Shows the Classification Details dialog and tags the classifcication as new
  addClassification() {
    this.isNewClassification = true;
    this.manageClassification = {} as Classification;
    this.editClassification = true;
  }

  // Sends a request to save or update the selected classification according to its tag
  saveClassification() {
    if (this.isNewClassification) {
      this.classificationService
        .postClassifications(this.manageClassification)
        .subscribe(
          () =>
            this.messageService.add({
              severity: 'info',
              summary: 'In process!',
              detail: 'Your module is being created!',
            }),
          (error) => {
            this.showErrorHandler(error);
          },
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success!',
              detail: 'Module created successfully!',
            });
            this.classificationService.getClassifications().subscribe(
              (clsf) => (this.classifications = clsf),
              (error) => {
                this.showErrorHandler(error);
              }
            );
            this.manageClassification = null;
            this.editClassification = false;
          }
        );
    } else {
      this.classificationService
        .putClassifications(this.manageClassification)
        .subscribe(
          () =>
            this.messageService.add({
              severity: 'info',
              summary: 'In process!',
              detail: 'Your module is being updated!',
            }),
          (error) => {
            this.showErrorHandler(error);
          },
          () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success!',
              detail: 'Module updated successfully!',
            });
            this.classificationService.getClassifications().subscribe(
              (clsf) => (this.classifications = clsf),
              (error) => {
                this.showErrorHandler(error);
              }
            );
            this.manageClassification = null;
            this.editClassification = false;
          }
        );
    }
  }

  // Creates a copy of the selected Classification
  cloneClassification(c: Classification): Classification {
    let clsf = {};
    for (let prop in c) {
      clsf[prop] = c[prop];
    }
    return clsf as Classification;
  }

  // Shows the confirmDeleteClassification message
  deleteClassification() {
    this.messageService.clear();
    this.messageService.add({
      key: 'confirmDeleteClassification',
      sticky: true,
      severity: 'warn',
      summary: 'Warning!',
      detail:
        'This operation is irreversible. Confirm to delete, or cancel to go back.',
    });
  }

  // Sends a request to delete the selected classification
  confirmDeleteClassification() {
    this.classificationService
      .deleteClassifications(this.manageClassification)
      .subscribe(
        () =>
          this.messageService.add({
            severity: 'info',
            summary: 'In process!',
            detail: 'Your module is being deleted!',
          }),
        (error) => {
          this.showErrorHandler(error);
        },
        () => {
          this.classificationService.getClassifications().subscribe(
            (clsf) => (this.classifications = clsf),
            (error) => {
              this.showErrorHandler(error);
            }
          );
          this.manageClassification = null;
          this.messageService.clear('confirmDeleteClassification');
          this.messageService.add({
            severity: 'success',
            summary: 'Success!',
            detail: 'Module deleted successfully!',
          });
          this.editClassification = false;
        }
      );
  }

  // Closes the confirmDeleteClassification message
  cancelDeleteClassification() {
    this.messageService.clear('confirmDeleteClassification');
  }

  // Shows the Module Details dialog and tags the module as not new
  selectModule(event) {
    this.isNewModule = false;
    this.manageModules = this.cloneModule(event.data);
    this.editModule = true;
  }

  // Sends a request to update the selected module
  saveModule() {
    if (this.isNewModule) {
      this.moduleService.postModule(this.manageModules).subscribe(
        () =>
          this.messageService.add({
            severity: 'info',
            summary: 'In process!',
            detail: 'Your module is being created!',
          }),
        (error) => {
          this.showErrorHandler(error);
        },
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success!',
            detail: 'Module created successfully!',
          });
          this.indSelectItems = [];
          this.moduleService.getModules().subscribe(
            (indicators) => {
              this.indicators = indicators;
              this.modules = indicators;
            },
            (error) => {
              this.showErrorHandler(error);
            },
            () => {
              this.indicators.forEach((indicator) => {
                this.indSelectItems.push({
                  label: indicator.label,
                  value: indicator,
                });
              });
            }
          );
          this.manageModules = null;
          this.editModule = false;
        }
      );
    } else {
      this.moduleService.putModule(this.manageModules).subscribe(
        () =>
          this.messageService.add({
            severity: 'info',
            summary: 'In process!',
            detail: 'Your module is being updated!',
          }),
        (error) => {
          this.showErrorHandler(error);
        },
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success!',
            detail: 'Module updated successfully!',
          });
          this.indSelectItems = [];
          this.moduleService.getModules().subscribe(
            (indicators) => {
              this.indicators = indicators;
              this.modules = indicators;
            },
            (error) => {
              this.showErrorHandler(error);
            },
            () => {
              this.indicators.forEach((indicator) => {
                this.indSelectItems.push({
                  label: indicator.label,
                  value: indicator,
                });
              });
            }
          );
          this.manageModules = null;
          this.editModule = false;
        }
      );
    }
  }

  // Creates a copy of the selected module
  cloneModule(m: Module): Module {
    let mdl = {};
    for (let prop in m) {
      mdl[prop] = m[prop];
    }
    return mdl as Module;
  }

  // Shows the confirmDeleteModule message
  deleteModule() {
    this.messageService.clear();
    this.messageService.add({
      key: 'confirmDeleteModule',
      sticky: true,
      severity: 'warn',
      summary: 'Warning!',
      detail:
        'This operation is irreversible. Confirm to delete, or cancel to go back.',
    });
  }

  // Sends a request to delete the selected module
  confirmDeleteModule() {
    this.moduleService.deleteModule(this.manageModules).subscribe(
      () =>
        this.messageService.add({
          severity: 'info',
          summary: 'In process!',
          detail: 'Your module is being deleted!',
        }),
      (error) => {
        this.showErrorHandler(error);
      },
      () => {
        this.indSelectItems = [];
        this.moduleService.getModules().subscribe(
          (indicators) => {
            this.indicators = indicators;
            this.modules = indicators;
          },
          (error) => {
            this.showErrorHandler(error);
          },
          () => {
            this.indicators.forEach((indicator) => {
              this.indSelectItems.push({
                label: indicator.label,
                value: indicator,
              });
            });
          }
        );
        this.manageModules = null;
        this.messageService.clear('confirmDeleteModule');
        this.messageService.add({
          severity: 'success',
          summary: 'Success!',
          detail: 'Module deleted successfully!',
        });
        this.editModule = false;
      }
    );
  }

  // Closes the confirmDeleteModule message
  cancelDeleteModule() {
    this.messageService.clear('confirmDeleteModule');
  }

  // Shows the Indicator Details dialog and tags the selected indicator as not new
  selectIndicator(event) {
    this.isNewIndicator = false;
    this.manageIndicators = this.cloneIndicator(event.data);
    this.editIndicator = true;
  }

  // Shows the Indicator Details dialog and tags the selected indicator as new
  addIndicator() {
    this.isNewIndicator = true;
    this.manageIndicators = {} as IndUp;
    this.editIndicator = true;
  }

  // Sends a request to save or update an indicator according to its tag
  saveIndicator() {
    if (this.isNewIndicator) {
      this.moduleService.postIndicators(this.manageIndicators).subscribe(
        () =>
          this.messageService.add({
            severity: 'info',
            summary: 'In process!',
            detail: 'Your indicator is being created!',
          }),
        (error) => {
          this.showErrorHandler(error);
        },
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success!',
            detail: 'Indicator created successfully!',
          });
          this.indsEditResult = [];
          this.moduleService.getIndicators().subscribe(
            (inds) => {
              this.inds = inds;
              inds.forEach((ind) =>
                this.indsEditResult.push({
                  value: ind.id,
                  label: ind.indicator,
                })
              );
            },
            (error) => {
              this.showErrorHandler(error);
            }
          );
          this.manageIndicators = null;
          this.editIndicator = false;
        }
      );
    } else {
      this.moduleService.putIndicators(this.manageIndicators).subscribe(
        () =>
          this.messageService.add({
            severity: 'info',
            summary: 'In process!',
            detail: 'Your indicator is being updated!',
          }),
        (error) => {
          this.showErrorHandler(error);
        },
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success!',
            detail: 'Indicator updated successfully!',
          });
          this.indsEditResult = [];
          this.moduleService.getIndicators().subscribe(
            (inds) => {
              this.inds = inds;
              inds.forEach((ind) =>
                this.indsEditResult.push({
                  value: ind.id,
                  label: ind.indicator,
                })
              );
            },
            (error) => {
              this.showErrorHandler(error);
            }
          );
          this.manageIndicators = null;
          this.editIndicator = false;
        }
      );
    }
  }

  // Creates a copy of the selected Indicator
  cloneIndicator(i: IndUp): IndUp {
    let ind = {};
    for (let prop in i) {
      ind[prop] = i[prop];
    }
    return ind as IndUp;
  }

  // Shows the confirmDeleteIndicator message
  deleteIndicator() {
    this.messageService.clear();
    this.messageService.add({
      key: 'confirmDeleteIndicator',
      sticky: true,
      severity: 'warn',
      summary: 'Warning!',
      detail:
        'This operation is irreversible. Confirm to delete, or cancel to go back.',
    });
  }

  // Sends a request to delete the selected indicator
  confirmDeleteIndicator() {
    this.moduleService.deleteIndicators(this.manageIndicators).subscribe(
      () =>
        this.messageService.add({
          severity: 'info',
          summary: 'In process!',
          detail: 'Your indicator is being deleted!',
        }),
      (error) => {
        this.showErrorHandler(error);
      },
      () => {
        this.indsEditResult = [];
        this.moduleService.getIndicators().subscribe(
          (inds) => {
            this.inds = inds;
            inds.forEach((ind) =>
              this.indsEditResult.push({ value: ind.id, label: ind.indicator })
            );
          },
          (error) => {
            this.showErrorHandler(error);
          }
        );
        this.manageIndicators = null;
        this.messageService.clear('confirmDeleteIndicator');
        this.messageService.add({
          severity: 'success',
          summary: 'Success!',
          detail: 'Indicator deleted successfully!',
        });
        this.editIndicator = false;
      }
    );
  }

  // Closes the confirmDeleteIndicator message
  cancelDeleteIndicator() {
    this.messageService.clear('confirmDeleteIndicator');
  }

  // Shows the Results Labeling Details dialog and tags the label as not new
  selectIndicatorResult(event) {
    this.isNewIndResult = false;
    this.manageIndResults = this.cloneIndicatorResult(event.data);
    this.editIndResult = true;
  }

  // Shows the Results Labeling Details dialog and tags the label as new
  addIndicatorResult() {
    this.isNewIndResult = true;
    this.manageIndResults = {} as IndResult;
    this.editIndResult = true;
  }

  // Sends a request to save or update a label according to its tag
  saveIndicatorResult() {
    if (this.isNewIndResult) {
      this.moduleService.postIndicatorResults(this.manageIndResults).subscribe(
        () =>
          this.messageService.add({
            severity: 'info',
            summary: 'In process!',
            detail: 'Your result labeling is being created!',
          }),
        (error) => {
          this.showErrorHandler(error);
        },
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success!',
            detail: 'Result labeling created successfully!',
          });
          this.moduleService.getIndicatorResults().subscribe(
            (indRes) => (this.indsResult = indRes),
            (error) => {
              this.showErrorHandler(error);
            }
          );
          if (this.scenarioResults || this.selectedScenarios) {
            this.getUPResults();
          }
          this.manageIndResults = null;
          this.editIndResult = false;
        }
      );
    } else {
      this.moduleService.putIndicatorResults(this.manageIndResults).subscribe(
        () =>
          this.messageService.add({
            severity: 'info',
            summary: 'In process!',
            detail: 'Your result labeling is being updated!',
          }),
        (error) => {
          this.showErrorHandler(error);
        },
        () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success!',
            detail: 'Result labeling updated successfully!',
          });
          this.moduleService.getIndicatorResults().subscribe(
            (indRes) => (this.indsResult = indRes),
            (error) => {
              this.showErrorHandler(error);
            }
          );
          if (this.scenarioResults || this.selectedScenarios) {
            this.getUPResults();
          }
          this.manageIndResults = null;
          this.editIndResult = false;
        }
      );
    }
  }

  // Creates a copy of the selected label
  cloneIndicatorResult(i: IndResult): IndResult {
    let ind = {};
    for (let prop in i) {
      ind[prop] = i[prop];
    }
    return ind as IndResult;
  }

  // Shows the confirmDeleteIndicatorResult message
  deleteIndicatorResult() {
    this.messageService.clear();
    this.messageService.add({
      key: 'confirmDeleteIndicatorResult',
      sticky: true,
      severity: 'warn',
      summary: 'Warning!',
      detail:
        'This operation is irreversible. Confirm to delete, or cancel to go back.',
    });
  }

  // Sends a request to delete the selected label
  confirmDeleteIndicatorResult() {
    this.moduleService.deleteIndicatorResults(this.manageIndResults).subscribe(
      () =>
        this.messageService.add({
          severity: 'info',
          summary: 'In process!',
          detail: 'Your result labeling is being deleted!',
        }),
      (error) => {
        this.showErrorHandler(error);
      },
      () => {
        this.moduleService.getIndicatorResults().subscribe(
          (indRes) => (this.indsResult = indRes),
          (error) => {
            this.showErrorHandler(error);
          }
        );
        if (this.scenarioResults || this.selectedScenarios) {
          this.getUPResults();
        }
        this.manageIndResults = null;
        this.messageService.clear('confirmDeleteIndicatorResult');
        this.messageService.add({
          severity: 'success',
          summary: 'Success!',
          detail: 'Result labeling deleted successfully!',
        });
        this.editIndResult = false;
      }
    );
  }

  // Closes the confirmDeleteIndicatorResult message
  cancelDeleteIndicatorResult() {
    this.messageService.clear('confirmDeleteIndicatorResult');
  }

  // Sends a request to install the module from the uploaded file.
  installModule(event) {
    this.block();
    this.moduleService.installModule(event.files[0]).subscribe(
      () =>
        this.messageService.add({
          severity: 'info',
          summary: 'In process!',
          detail: 'Your module is being installed!',
        }),
      (error) => {
        this.showErrorHandler(error);
      },
      () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success!',
          detail: 'Module installed successfully!',
        });
        this.indSelectItems = [];
        this.moduleService.getModules().subscribe(
          (indicators) => {
            this.indicators = indicators;
            this.modules = indicators;
          },
          (error) => {
            this.showErrorHandler(error);
          },
          () => {
            this.indicators.forEach((indicator) => {
              this.indSelectItems.push({
                label: indicator.label,
                value: indicator,
              });
            });
          }
        );
        this.unblock();
      }
    );
  }

  showErrorHandler(error) {
    this.logErrorHandler.emit(error);
  }

  block() {
    this.blockDocument.emit(null);
  }

  unblock() {
    this.unblockDocument.emit(null);
  }

  clearResultsConsole() {
    this.clearEvaluation.emit(null);
  }

  showResultsConsole() {
    this.showEvaluation.emit(null);
  }

  hideResultsConsole() {
    this.hideEvaluation.emit(null);
  }

  constructor(private nodeService: NodeService,
              private listService: ListService,
              private scenarioService: ScenarioService,
              private assumptionService: AssumptionService,
              private resultsService: ResultsService,
              private layersService: LayerService,
              private dataCopyService: DataCopyService,
              private messageService: MessageService,
              private statusService: StatusService,
              private moduleService: ModuleService,
              private upMiscService: UpMiscService,
              private classificationService: ClassificationService,
              public ref: DynamicDialogRef,
              public config: DynamicDialogConfig) {
    // Sets values for the UP Results graph.
    this.resultOptionsUP = {
      legend: {
        position: 'top',
        labels: {
          fontColor: '#ffffff',
        },
      },
      title: {
        display: true,
        text: 'Scenario Comparisons',
        fontColor: '#fff',
      },
      scale: {
        gridLines: {
          color: '#ffffff',
          lineWidth: 0.7,
        },
        angleLines: {
          display: true,
        },
        ticks: {
          beginAtZero: true,
          min: 0,
          max: 100,
          stepSize: 50,
          display: false,
        },
        pointLabels: {
          fontSize: 11,
          fontColor: '#ffffff',
        },
      },
      tooltips: {
        callbacks: {
          label: function (tooltipItem, data) {
            let label = data.datasets[tooltipItem.datasetIndex].label || '';
            if (label) {
              label += ': ';
            }
            label += Math.round(tooltipItem.yLabel * 100) / 100;
            label += '%';
            return label;
          },
          title: function (tooltipItem, data) {
            return 'Values';
          },
        },
      },
    };
   }

  ngOnInit() {
    this.showCreate = false;
    this.showManage = false;
    this.showResults = false;
    this.showScenariosUP = false;
    this.colsScenario = [
      { field: 'name', header: 'Name' },
      { field: 'description', header: 'Description' },
      { field: 'is_base', header: 'Is baseline?' },
    ];
    this.colsAssumption = [
      { field: 'name', header: 'Name' },
      { field: 'category', header: 'Category' },
      { field: 'value', header: 'Value' },
      { field: 'units', header: 'Units' },
      { field: 'description', header: 'Description' },
      { field: 'source', header: 'Source' },
    ];
    this.colsClassification = [
      { field: 'name', header: 'Name' },
      { field: 'category', header: 'Category' },
      { field: 'fclass', header: 'F-class' },
    ];
    this.colsModules = [
      { field: 'name', header: 'Name' },
      { field: 'label', header: 'Label' },
      { field: 'description', header: 'Description' },
    ];
    this.colsIndicators = [{ field: 'indicator', header: 'Indicator' }];
    this.colsIndResults = [
      { field: 'label', header: 'Label' },
      { field: 'units', header: 'units' },
      { field: 'language', header: 'Language' },
      { field: 'up_indicators_id', header: 'Indicator' },
    ];
  }

}
