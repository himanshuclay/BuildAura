<template>
  <div class="page">
    <div class="page-head">
      <div class="title-wrap">
        <h1 class="page-title">Employee List</h1>
        <p class="page-sub">Manage team members and their signatures.</p>
      </div>
      <button type="button" class="btn add-btn" @click="employee.isShowModal = true">
        <span class="plus">＋</span> Add Employee
      </button>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th style="width:80px">Sr.No</th>
              <th>Name</th>
              <th>Email</th>
              <th style="width:160px">Signature</th>
              <th style="width:120px">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(emp, i) in employee.list" :key="i">
              <td class="muted">#{{ i + 1 }}</td>
              <td class="emp-name">
                <div class="name-cell">
                  <div class="avatar" :title="emp.name">
                    <img v-if="emp.signature" :src="emp.signature" alt="" />
                    <span v-else>{{ (emp.name || 'NA').slice(0,1).toUpperCase() }}</span>
                  </div>
                  <div class="name-email">
                    <div class="name">{{ emp.name || '-' }}</div>
                    <div class="sub muted">Employee</div>
                  </div>
                </div>
              </td>
              <td>
                <div class="email">{{ emp.email || '-' }}</div>
              </td>
              <td>
                <div class="sig-preview">
                  <img v-if="emp.signature" :src="emp.signature" alt="Signature" />
                  <span v-else class="no-sig">No signature</span>
                </div>
              </td>
              <td>
                <button type="button" class="btn ghost sm" @click="edit(emp)">Edit</button>
              </td>
            </tr>
            <tr v-if="!employee.list || employee.list.length === 0">
              <td colspan="5" class="empty">
                No employees found. Click <strong>Add Employee</strong> to create one.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Modal :show="employee.isShowModal" @close="employee.isShowModal = false">
      <template #header>
        <h3 class="modal-title">{{ isEdit ? 'Edit Employee' : 'Add Employee' }}</h3>
      </template>

      <div class="form">
        <div class="form-row">
          <div class="form-group">
            <label>Name</label>
            <input type="text" v-model="employee.form.name" required placeholder="Enter name" />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input type="email" v-model="employee.form.email" required placeholder="Enter email" />
          </div>
        </div>

        <div class="form-group">
          <label>Signature</label>
          <div class="file-inline">
            <input type="file" class="file" @change="onFileChange" required />
            <span class="hint muted">PNG/JPG preferred • Max height 50px</span>
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="btn ghost" @click="employee.isShowModal = false">Cancel</button>
        <button type="button" class="btn add-btn" @click="save">{{ isEdit ? 'Update' : 'Save' }}</button>
      </template>
    </Modal>
  </div>
</template>


<script setup>
import Modal from '../../common/Modal.vue'
import api from '~~/api.config'

const config = useRuntimeConfig()

const employee = reactive({
    isShowModal: false,
    list: [],
    form: {
        name: null,
        email: null,
        signature: null, // File
    },
})

const isEdit = ref(false)

function onFileChange(e) {
    employee.form.signature = e.target.files[0] || null
}

async function save() {
    try {
        const fd = new FormData()
        fd.append('name', employee.form.name || '')
        fd.append('email', employee.form.email || '')
        fd.append('_id', employee.form._id || '')
        if (employee.form.signature) {
            fd.append('signature', employee.form.signature)
        }

        const response = await api.post(
            `${config.public.API}/api/employee/save`,
            fd,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
            }
        )

        // example: show saved employee immediately in table
        const sigUrl = employee.form.signature
            ? URL.createObjectURL(employee.form.signature)
            : ''
        if (employee.form._id) {
            employee.list = employee.list.map(l =>
                l._id === employee.form._id
                    ? {
                        ...l, // keep old fields
                        name: employee.form.name,
                        email: employee.form.email,
                        signature: sigUrl,
                    }
                    : l
            )
        } else {
            employee.list.push({
                name: employee.form.name,
                email: employee.form.email,
                signature: sigUrl,
            })
        }

        employee.isShowModal = false
        employee.form = { name: null, email: null, signature: null }
    } catch (error) {
        console.error(error)
    }
}
async function fetch() {
    try {
        const response = await api.get(`${config.public.API}/api/employee/fetch`);
        console.log(response);

        const list = response.data.list.map(l => {
            return {
                ...l,
                signature: l.signature ? `${config.public.API}${l.signature}` : ''
            }
        });

        employee.list = list;
    } catch (error) {
        console.error(error);
    }
}

function edit(emp) {
    console.log(emp)
    employee.form = emp;
    employee.isShowModal = true;
}


onMounted(fetch);
</script>

<style scoped>
/* Layout */
.page { display: grid; gap: 16px; }
.page-head {
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.title-wrap { display: grid; gap: 4px; }
.page-title { margin: 0; font-size: 24px; line-height: 1.2; font-weight: 700; }
.page-sub { margin: 0; font-size: 13px; color: #6b7280; }

/* Card */
.card {
  background: #fff; border: 1px solid #e5e7eb; border-radius: 14px;
  box-shadow: 0 1px 2px rgba(0,0,0,.03); overflow: hidden;
}

/* Table */
.table-wrap { width: 100%; overflow: auto; }
.table { width: 100%; border-collapse: separate; border-spacing: 0; }
.table thead th {
  text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: .04em;
  color: #6b7280; background: #f9fafb; padding: 12px 16px; border-bottom: 1px solid #e5e7eb;
  position: sticky; top: 0; z-index: 1;
}
.table tbody td {
  padding: 14px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle;
}
.table tbody tr:hover td { background: #fcfcff; }

/* Cells */
.muted { color: #6b7280; }
.name-cell { display: flex; align-items: center; gap: 12px; }
.avatar {
  width: 40px; height: 40px; border-radius: 50%; overflow: hidden;
  background: #eef2ff; color: #4f46e5; display: grid; place-items: center; font-weight: 700;
  border: 1px solid #e5e7eb;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.name-email .name { font-weight: 600; }
.sub { font-size: 12px; }

.email { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

/* Signature preview */
.sig-preview {
  height: 50px; display: flex; align-items: center; justify-content: flex-start;
}
.sig-preview img {
  max-height: 50px; max-width: 140px; object-fit: contain; border-radius: 6px;
  border: 1px dashed #e5e7eb; background: #fff;
}
.no-sig {
  font-size: 12px; color: #9ca3af; border: 1px dashed #e5e7eb; padding: 6px 10px; border-radius: 6px;
}

/* Empty state */
.empty {
  text-align: center; color: #6b7280; padding: 40px 16px; font-size: 14px;
}

/* Buttons */
.btn {
  --btn-bg: #111827; --btn-color: #fff; --btn-border: #111827;
  appearance: none; border: 1px solid var(--btn-border); background: var(--btn-bg);
  color: var(--btn-color); padding: 10px 14px; border-radius: 10px; font-weight: 600;
  font-size: 14px; cursor: pointer; transition: .2s ease; line-height: 1;
}
.btn:hover { filter: brightness(0.95); }
.btn:active { transform: translateY(1px); }

.btn.ghost {
  --btn-bg: #fff; --btn-color: #111827; --btn-border: #e5e7eb;
}
.btn.add-btn {
  --btn-bg: #4f46e5; --btn-border: #4f46e5;
}
.btn.sm { padding: 8px 12px; font-size: 13px; }
.plus { margin-right: 6px; font-weight: 700; }

/* Modal form */
.modal-title { margin: 0; font-weight: 700; }
.form { display: grid; gap: 16px; }
.form-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.form-group { display: grid; gap: 8px; }
.form-group label { font-size: 13px; color: #374151; font-weight: 600; }
.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="file"],
.form-group .file {
  width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 10px;
  background: #fff; font-size: 14px; outline: none; transition: border-color .15s ease;
}
.form-group input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79,70,229,.1); }
.file-inline { display: flex; align-items: center; gap: 10px; }
.hint { font-size: 12px; }

/* Responsive */
@media (max-width: 768px) {
  .page-head { flex-direction: column; align-items: flex-start; }
  .form-row { grid-template-columns: 1fr; }
  .table thead th:nth-child(1),
  .table tbody td:nth-child(1) { width: 56px; }
}
</style>
